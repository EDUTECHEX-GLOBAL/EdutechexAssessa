const pdf = require('pdf-parse');
const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require('@aws-sdk/client-bedrock-runtime');

// Initialize AWS Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_MODEL_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_MODEL_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_MODEL_ACCESS_KEY,
  },
});

// ==================== SECTION DETECTION ====================

/**
 * Enhanced section detection that handles:
 * - Multiple possible header formats
 * - Multi-line headers
 * - Page breaks
 */
function detectSections(fullText) {
  const normalized = fullText.replace(/\s+/g, ' ').toLowerCase();

  const sections = {
    reading: { start: 0, end: -1, content: '', header: '' },
    writing: { start: -1, end: -1, content: '', header: '' },
    math_no_calc: { start: -1, end: -1, content: '', header: '' },
    math_calc: { start: -1, end: -1, content: '', header: '' }
  };

  // SUPER LOOSE regex for SAT sections
  const keywords = [
    { type: 'reading', regex: /\breading\b|reading\s*&\s*writing/gi },
    { type: 'writing', regex: /\bwriting\b/gi },
    { type: 'math_no_calc', regex: /math[\s\-_]*(test)?[\s\-_]*(no[\s\-_]*calc(ulator)?)/gi },
    { type: 'math_calc', regex: /math[\s\-_]*(test)?[\s\-_]*(with[\s\-_]*calc(ulator)?|calc(ulator)?)/gi }
  ];

  const markers = [];
  keywords.forEach(({ type, regex }) => {
    let match;
    while ((match = regex.exec(normalized)) !== null) {
      markers.push({ type, index: match.index, length: match[0].length, header: match[0] });
    }
  });

  markers.sort((a, b) => a.index - b.index);

  markers.forEach((marker, i) => {
    const nextMarker = i < markers.length - 1 ? markers[i + 1] : null;
    sections[marker.type] = {
      start: marker.index,
      end: nextMarker ? nextMarker.index : fullText.length,
      content: fullText.slice(
        marker.index + marker.length,
        nextMarker ? nextMarker.index : fullText.length
      ).trim(),
      header: marker.header
    };
  });

  // 🔑 Force-fallback: if any section not found → use full PDF
  Object.keys(sections).forEach(type => {
    if (sections[type].start === -1) {
      sections[type] = {
        start: 0,
        end: fullText.length,
        content: fullText.trim(),
        header: 'Full PDF (fallback)'
      };
    }
  });

  console.log('Detected sections (lenient):');
  Object.entries(sections).forEach(([type, { start, header }]) => {
    console.log(`${type}: ${header ? header : 'Fallback (full PDF)'}`);
  });

  return sections;
}

// ==================== NEW: SAT MARKDOWN PARSER ====================

function parseSATMarkdownToQuestions(markdownText, sectionType) {
  const questions = [];
  const isMath = sectionType.includes('math');
  
  // Split by passages (for reading/writing) or question blocks (for math)
  const blocks = markdownText.split(/(?=^Passage:\s*|^\d+\.\s)/mi);
  
  let currentPassage = '';

  for (const block of blocks) {
    const lines = block.trim().split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Handle passages for reading/writing sections
    if (!isMath && /^Passage:\s*/i.test(lines[0])) {
      currentPassage = lines[0].replace(/^Passage:\s*/i, '').trim();
      // Check if passage continues on next lines
      for (let i = 1; i < lines.length; i++) {
        if (/^\d+\.\s/.test(lines[i])) break;
        currentPassage += ' ' + lines[i];
      }
      currentPassage = currentPassage.trim();
      continue;
    }

    // Extract question
    const firstLineMatch = lines[0].match(/^(\d+)\.\s*(.+)$/);
    if (!firstLineMatch) continue;

    const questionText = firstLineMatch[2];
    const options = [];
    let correctAnswer = null;
    let type = isMath ? 'grid_in' : 'mcq';

    // Process options and answers
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Option detection for MCQ
      const optionMatch = line.match(/^([A-D])\.\s*(.+)$/i);
      if (optionMatch) {
        options.push(optionMatch[2].trim());
        type = 'mcq';
        continue;
      }

      // Correct answer detection
      const answerMatch = line.match(/^Correct:\s*([A-D0-9\.\/\-]+)/i);
      if (answerMatch) {
        correctAnswer = answerMatch[1];
      }
    }

    // Create question object
    if (type === 'mcq' && options.length === 4 && correctAnswer !== null) {
      questions.push({
        type: 'mcq',
        questionText,
        passage: !isMath ? currentPassage : '',
        options,
        correctAnswer: ['A', 'B', 'C', 'D'].indexOf(correctAnswer.toUpperCase()),
        marks: 1,
        fromAI: false
      });
    } else if (type === 'grid_in' && correctAnswer) {
      questions.push({
        type: 'grid_in',
        questionText,
        passage: '',
        correctAnswer: String(correctAnswer),
        marks: 1,
        fromAI: false
      });
    }
  }

  console.log(`✅ Parsed ${questions.length} questions from SAT Markdown for ${sectionType}`);
  return questions;
}

// ==================== QUESTION PARSING ====================

function parseReadingWritingQuestions(sectionText) {
  const questions = [];

  if (!sectionText || !sectionText.trim()) return questions;

  // Normalize text and ensure predictable newlines
  const text = '\n' + sectionText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Find all question start positions: lines that begin with a number like "1. "
  const qMatches = Array.from(text.matchAll(/\n\s*(\d+)\.\s/g));

  if (qMatches.length === 0) {
    console.log('⚠️ parseReadingWritingQuestions: No numbered questions found');
    return questions;
  }

  // Helper to find last occurrence of the word "passage" before a given index (case-insensitive)
  const findLastPassageBefore = (idx) => {
    const prefix = text.slice(0, idx);
    const lower = prefix.toLowerCase();
    const pIdx = lower.lastIndexOf('passage');
    if (pIdx === -1) return null;

    // extract from the "passage" word up to idx
    let passageRaw = prefix.slice(pIdx, idx);

    // remove "passage" label if present
    passageRaw = passageRaw.replace(/passage\s*\d*[:\-\s]*/i, '').trim();

    // cleanup excessive whitespace and return
    return passageRaw.length ? passageRaw.replace(/\n\s*/g, ' ').trim() : null;
  };

  // Iterate over each question block determined by qMatches
  for (let i = 0; i < qMatches.length; i++) {
    const startIndex = qMatches[i].index;
    const endIndex = i + 1 < qMatches.length ? qMatches[i + 1].index : text.length;
    const block = text.slice(startIndex, endIndex).trim();

    if (!block) continue;

    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const qMatch = lines[0].match(/^\d+\.\s*(.+)/);
    if (!qMatch) continue;

    const questionText = qMatch[1].trim();
    const options = [];
    let correctAnswer = null;

    for (let j = 1; j < lines.length; j++) {
      const line = lines[j];

      // Option detection (A-D)
      const optMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);
      if (optMatch) {
        options.push(optMatch[2].trim());
        continue;
      }

      // Correct answer detection
      const ansMatch = line.match(/Correct[:\-]?\s*([A-D])/i);
      if (ansMatch) {
        correctAnswer = ['A','B','C','D'].indexOf(ansMatch[1].toUpperCase());
      }
    }

    // Find associated passage by looking backwards for a Passage marker before this question
    let passage = findLastPassageBefore(startIndex);
    // If not found, fallback to empty string (frontend will skip rendering)
    if (!passage) passage = '';

    if (options.length === 4 && correctAnswer !== null) {
      questions.push({
        type: 'mcq',
        questionText,
        passage,
        options,
        correctAnswer,
        marks: 1
      });
    } else {
      // It's possible the original text uses grid-ins or no options — treat as grid_in fallback
      if (correctAnswer === null) {
        // Try to find a numeric/string correct answer line in the block
        const ansLine = lines.find(l => /Correct[:\-]?\s*([0-9\.\-\/A-Za-z]+)/i.test(l));
        const ansVal = ansLine ? (ansLine.match(/Correct[:\-]?\s*([0-9\.\-\/A-Za-z]+)/i)[1]) : null;
        if (ansVal) {
          questions.push({
            type: 'grid_in',
            questionText,
            passage,
            correctAnswer: String(ansVal).trim(),
            marks: 1
          });
        }
      }
    }
  }

  console.log(`📘 Parsed ${questions.length} reading/writing questions (with passages where found)`);
  return questions;
}

function parseMathQuestions(sectionText, sectionType) {
  const questions = [];
  
  // Split by question numbers
  const questionBlocks = sectionText.split(/(?=\d+\.\s)/g);
  
  questionBlocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return;

    const qMatch = lines[0].match(/^(\d+)\.\s*(.+)/);
    if (!qMatch) return;

    const questionText = qMatch[2];
    const options = [];
    let correctAnswer = null;

    // Process options and answers
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Option detection (A-D)
      const optMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);
      if (optMatch) {
        options.push(optMatch[2]);
        continue;
      }

      // Correct answer detection
      const ansMatch = line.match(/Correct[:\-]?\s*([A-D0-9\.\/]+)/i);
      if (ansMatch) {
        correctAnswer = ansMatch[1];
      }
    }

    if (options.length === 4 && correctAnswer !== null) {
      // MCQ question
      questions.push({
        type: 'mcq',
        questionText,
        options,
        correctAnswer: ['A', 'B', 'C', 'D'].indexOf(correctAnswer.toUpperCase()),
        marks: 1
      });
    } else if (correctAnswer) {
      // Grid-in question
      questions.push({
        type: 'grid_in',
        questionText,
        correctAnswer: String(correctAnswer),
        marks: 1
      });
    }
  });

  console.log(`🧮 Parsed ${questions.length} ${sectionType} questions`);
  return questions;
}

// ==================== AI GENERATION ====================

async function generateAIQuestions(originalQuestions, sectionType, difficulty = 'medium') {
  const isMath = sectionType.includes('math');
  const questionCount = isMath ? 20 : 25;

  // Build a prompt that *requires* the model to output a "Passage:" section for reading/writing
  const prompt = isMath ? `
You are an expert SAT Math test writer. Generate ${questionCount} NEW ${difficulty} difficulty math questions for the section "${sectionType.replace('_',' ')}".
- Include roughly 6 MCQs and 2 grid-in where appropriate.
- Base the style on these examples (do not copy them verbatim):
${originalQuestions.slice(0, 2).map(q => (q.questionText || '').slice(0, 140)).join('\n')}

Output format (strict):
1. Question text?
A. Option A
B. Option B
C. Option C
D. Option D
Correct: B

For grid-in questions:
7. Question text...
Correct: 2

Return only the question blocks as plain text in the format requested.
` : `
You are an expert SAT Reading/Writing test writer. For the section "${sectionType}", generate ${questionCount} NEW ${difficulty} difficulty passages + question(s).
For each group, begin with "Passage: " followed by a 3-5 sentence passage. Then list one MCQ for that passage in this exact format:

Passage: [short passage]

1. Question text?
A. Option A
B. Option B
C. Option C
D. Option D
Correct: B

Repeat for all ${questionCount} questions. Use the following examples for style (do not copy them directly):
${originalQuestions.slice(0, 3).map(q => q.questionText).join('\n')}

Return only the blocks exactly in the format above.
`;

  try {
    // call Bedrock (same as earlier)
    const response = await bedrockClient.send(new InvokeModelCommand({
      modelId: 'mistral.mistral-large-2402-v1:0',
      body: JSON.stringify({
        prompt,
        max_tokens: 2048,
        temperature: 0.6
      })
    }));

    const generatedText = JSON.parse(new TextDecoder().decode(response.body)).outputs[0].text;
    // Normalize blocks starting at question numbers (and passages)
    const blocks = generatedText.split(/(?=\n\s*\d+\.\s)|(?=\n\s*Passage[:\s])/).map(b => b.trim()).filter(Boolean);

    // Debug sample of generated text
    console.log("🔍 AI generated blocks preview:");
    blocks.slice(0, 6).forEach((b, idx) => console.log(`Block ${idx + 1}:`, b.substring(0, 200)));

    let lastExtractedPassage = '';

    const questions = [];

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      if (!isMath) {
        // Try to extract Passage first (if present)
        let passage = '';
        const passageLineIdx = lines.findIndex(line => /^passage[:\s]/i.test(line));
        if (passageLineIdx !== -1) {
          // passage might be the rest of the line or following lines until we hit a numbered question
          let p = lines[passageLineIdx].replace(/^passage[:\s]*/i, '').trim();
          // If passage line is just "Passage:" then collect the following non-question lines
          if (!p) {
            const following = [];
            for (let k = passageLineIdx + 1; k < lines.length; k++) {
              if (/^\d+\.\s/.test(lines[k])) break;
              following.push(lines[k]);
            }
            p = following.join(' ');
          }
          passage = p.trim();
          if (passage) lastExtractedPassage = passage;
        }

        // If no explicit "Passage" label, fallback to lastExtractedPassage
        if (!passage) passage = lastExtractedPassage || (originalQuestions[0] && originalQuestions[0].passage) || '';

        // Find first line that starts with a question number
        const qStartIdx = lines.findIndex(l => /^\d+\.\s/.test(l));
        if (qStartIdx === -1) continue;
        const qMatch = lines[qStartIdx].match(/^\d+\.\s*(.+)/);
        if (!qMatch) continue;
        const questionText = qMatch[1].trim();

        const options = [];
        let correctAnswer = null;
        for (let i = qStartIdx + 1; i < lines.length; i++) {
          const optMatch = lines[i].match(/^([A-D])[\.\)]\s*(.+)/i);
          if (optMatch) {
            options.push(optMatch[2].trim());
            continue;
          }
          const ansMatch = lines[i].match(/Correct[:\-]?\s*([A-D])/i);
          if (ansMatch) {
            correctAnswer = ['A','B','C','D'].indexOf(ansMatch[1].toUpperCase());
          }
        }

        if (options.length === 4 && correctAnswer !== null) {
          questions.push({
            type: 'mcq',
            questionText,
            passage,
            options,
            correctAnswer,
            marks: 1,
            fromAI: true
          });
        }
      } else {
        // Math parsing: similar to existing behavior
        const qMatch = lines[0].match(/^\d+\.\s*(.+)/);
        if (!qMatch) continue;
        const questionText = qMatch[1];
        const options = [];
        let correctAnswer = null;
        for (let i = 1; i < lines.length; i++) {
          const optMatch = lines[i].match(/^([A-D])[\.\)]\s*(.+)/i);
          if (optMatch) options.push(optMatch[2].trim());
          const ansMatch = lines[i].match(/Correct[:\-]?\s*([A-D0-9\.\/\-]+)/i);
          if (ansMatch) correctAnswer = ansMatch[1];
        }

        if (options.length === 4 && correctAnswer !== null) {
          questions.push({
            type: 'mcq',
            questionText,
            options,
            correctAnswer: isNaN(parseInt(correctAnswer)) ? ['A','B','C','D'].indexOf(correctAnswer.toUpperCase()) : correctAnswer,
            marks: 1,
            fromAI: true
          });
        } else if (correctAnswer) {
          questions.push({
            type: 'grid_in',
            questionText,
            correctAnswer: String(correctAnswer),
            marks: 1,
            fromAI: true
          });
        }
      }
    } // end for blocks

    console.log(`✅ AI generated ${questions.length} ${sectionType} questions (difficulty: ${difficulty})`);
    return questions;
  } catch (err) {
    console.error('❌ AI generation failed:', err);
    return [];
  }
}

// ==================== MAIN FUNCTIONS ====================

async function parseSATAssessment(fileBuffer, sectionType, difficulty = 'medium', fileType = 'pdf') {
  try {
    console.log(`📄 Parsing SAT ${fileType.toUpperCase()}: ${sectionType} (difficulty: ${difficulty})`);
    
    let originalQuestions = [];
    
    if (fileType === 'markdown') {
      // Parse from Markdown
      const markdownText = fileBuffer.toString('utf8');
      originalQuestions = parseSATMarkdownToQuestions(markdownText, sectionType);
    } else {
      // Parse from PDF (existing logic)
      const data = await pdf(fileBuffer);
      const sections = detectSections(data.text);

      if (!sections[sectionType] || sections[sectionType].start === -1) {
        console.warn(`⚠️ Section not found: ${sectionType}. Using full PDF as fallback.`);
        sections[sectionType] = { start: 0, end: data.text.length, content: data.text, header: 'Full PDF (fallback)' };
      }

      if (sectionType === 'reading' || sectionType === 'writing') {
        originalQuestions = parseReadingWritingQuestions(sections[sectionType].content);
      } else {
        originalQuestions = parseMathQuestions(sections[sectionType].content, sectionType);
      }
    }

    if (originalQuestions.length === 0) {
      console.warn(`⚠️ No questions found in ${sectionType}`);
      // Still attempt to call AI with an empty originalQuestions array (AI will create passages)
    }

    const aiQuestions = await generateAIQuestions(originalQuestions, sectionType, difficulty);
    return aiQuestions;
  } catch (err) {
    console.error(`❌ Error parsing ${fileType.toUpperCase()} ${sectionType}:`, err);
    return [];
  }
}

async function parseSATAssessmentCombined(fileBuffer, difficulty = 'medium', fileType = 'pdf') {
  try {
    let sections = {};
    
    if (fileType === 'markdown') {
      // For Markdown, we'll parse all sections from the same file
      const markdownText = fileBuffer.toString('utf8');
      sections = {
        reading: { content: markdownText },
        writing: { content: markdownText },
        math_no_calc: { content: markdownText },
        math_calc: { content: markdownText }
      };
    } else {
      // For PDF, use existing section detection
      const data = await pdf(fileBuffer);
      sections = detectSections(data.text);
    }

    const sectionTypes = ['reading', 'writing', 'math_no_calc', 'math_calc'];

    // Build work items first (sync, fast)
    const workItems = sectionTypes.map((sectionType) => {
      let originalQuestions = [];
      if (sectionType === 'reading' || sectionType === 'writing') {
        originalQuestions = parseReadingWritingQuestions(sections[sectionType].content);
      } else {
        originalQuestions = parseMathQuestions(sections[sectionType].content, sectionType);
      }
      return { sectionType, originalQuestions };
    });

    // 🔁 Run AI generation for all sections in parallel to reduce wall time
    const results = await Promise.allSettled(
      workItems.map(({ sectionType, originalQuestions }) =>
        generateAIQuestions(originalQuestions, sectionType, difficulty)
      )
    );

    // Flatten successful results
    let allQuestions = [];
    results.forEach((res, idx) => {
      const sec = workItems[idx].sectionType;
      if (res.status === 'fulfilled' && Array.isArray(res.value) && res.value.length > 0) {
        console.log(`✅ Generated ${res.value.length} questions for ${sec} (${difficulty})`);
        allQuestions = allQuestions.concat(res.value);
      } else {
        console.warn(`⚠️ No questions generated for ${sec} (${difficulty})`);
      }
    });

    console.log(`✅ Generated ${allQuestions.length} total questions (combined) for difficulty: ${difficulty}`);
    return allQuestions;
  } catch (err) {
    console.error('❌ Error parsing combined assessment:', err);
    return [];
  }
}

module.exports = {
  parseSATAssessment,
  parseSATAssessmentCombined
};