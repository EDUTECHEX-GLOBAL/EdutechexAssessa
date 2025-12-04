const pdf = require('pdf-parse');
const { Buffer } = require('buffer');
const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require('@aws-sdk/client-bedrock-runtime');

// ——— Bedrock client setup ———
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_MODEL_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_MODEL_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_MODEL_ACCESS_KEY,
  },
});

// ——— Helper: Parse a single AI-generated question block into an object ———
function parseAIQuestionBlock(block) {
  const lines = block
    .trim()
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  // First line: "1. Question text?"
  let questionText = lines[0].replace(/^\d+\.\s*/, '').trim();

  const options = [];
  let correctAnswer = null;

  // Iterate subsequent lines to collect A.–D. and Correct:
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const optMatch = line.match(/^([A-D])[\.\)]\s*(.+)$/i);
    if (optMatch) {
      options.push(optMatch[2].trim());
      continue;
    }
    const corrMatch = line.match(/^Correct:\s*([A-D])/i);
    if (corrMatch) {
      correctAnswer = ['A', 'B', 'C', 'D'].indexOf(corrMatch[1].toUpperCase());
    }
  }

  // If parsing failed to find 4 options or correctAnswer, skip this question
  if (options.length !== 4 || correctAnswer === null) {
    return null;
  }

  return {
    questionText,
    options,
    correctAnswer,
    marks: 1,
    type: "mcq"
  };
}

// ——— Call Bedrock to generate new questions ———
async function callBedrockForQuestions(originalQuestions) {
  const inputQuestions = originalQuestions
    .map((q, idx) => `${idx + 1}. ${q.questionText}`)
    .join('\n');

  const prompt = `
You are an expert educational assistant.

Read the following multiple-choice questions and generate 8 to 10 new original questions of similar topic and difficulty.

Each generated question must:
- Have exactly 4 options labeled A to D
- Clearly indicate the correct option like: "Correct: C"
- Follow this format:

1. Sample question?
A. Option 1
B. Option 2
C. Option 3
D. Option 4
Correct: B

Original questions:
${inputQuestions}

Now generate the new questions:
`;

  console.log('📤 Sending prompt to Bedrock (Mistral 70B)...');

  const command = new InvokeModelCommand({
    modelId: 'mistral.mistral-large-2402-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt,
      max_tokens: 8192,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  try {
    const response = await bedrockClient.send(command);
    const rawBody = new TextDecoder().decode(response.body);
    const responseBody = JSON.parse(rawBody);

    const generatedText = responseBody.outputs?.[0]?.text || '';

    // Split by lines that start with a number and dot ("1. ", "2. ", …)
    const rawBlocks = generatedText
      .split(/\n(?=\d+\.\s)/)
      .map(q => q.trim())
      .filter(Boolean);

    // Parse each block into a structured { questionText, options, correctAnswer, marks }
    const parsedAIQuestions = rawBlocks
      .map(block => parseAIQuestionBlock(block))
      .filter(q => q !== null);

    console.log(`✅ Parsed ${parsedAIQuestions.length} AI-generated questions.`);
    return parsedAIQuestions;
  } catch (err) {
    console.error('❌ Bedrock call failed:', err);
    return [];
  }
}

// ——— FLEXIBLE: Markdown Parser ———
function parseMarkdownToQuestions(markdownText) {
  console.log('🔍 Starting FIXED Markdown parsing...');
  
  const questions = [];
  
  // BETTER markdown cleaning - handle bold text properly
  const cleanText = markdownText
    .replace(/\*\*Correct:\*\*/g, 'Correct:')  // Fix **Correct:** specifically
    .replace(/\*\*(.*?)\*\*/g, '$1')           // Remove other **bold**
    .replace(/\*(.*?)\*/g, '$1')               // Remove *italic*
    .replace(/#+\s*(.*?)\n/g, '')              // Remove headers
    .replace(/-{3,}/g, '')                     // Remove horizontal rules
    .replace(/`{3}.*?`{3}/gs, '')              // Remove code blocks
    .replace(/`(.*?)`/g, '$1')                 // Remove inline code
    .replace(/\n\s*\n/g, '\n')                 // Normalize line breaks
    .trim();

  console.log('📄 Cleaned Markdown preview:', cleanText.substring(0, 500));

  // Split by questions - more reliable approach
  const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentQuestion = null;
  let collectingOptions = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect question start
    const questionMatch = line.match(/^(\d+)[\.\)]\s*(.+)$/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.options.length >= 2 && currentQuestion.correctAnswer !== null) {
        questions.push(currentQuestion);
        console.log(`✅ Added question: ${currentQuestion.questionText.substring(0, 50)}...`);
      }
      
      // Start new question
      currentQuestion = {
        questionText: questionMatch[2],
        options: [],
        correctAnswer: null,
        marks: 1,
        type: "mcq",
        fromAI: false
      };
      collectingOptions = true;
      console.log(`\n🔍 New question: ${currentQuestion.questionText.substring(0, 80)}...`);
      continue;
    }

    // If we're in a question block, process options and answers
    if (currentQuestion && collectingOptions) {
      // Option detection
      const optionMatch = line.match(/^([A-D])[\.\)]\s*(.+)$/i);
      if (optionMatch) {
        currentQuestion.options.push(optionMatch[2].trim());
        console.log(`✅ Option ${optionMatch[1]}: ${optionMatch[2].substring(0, 50)}`);
        continue;
      }

      // Correct answer detection - handle multiple formats
      const correctPatterns = [
        /Correct:\s*([A-D])/i,
        /Answer:\s*([A-D])/i,
        /Right:\s*([A-D])/i,
        /Key:\s*([A-D])/i,
        /Solution:\s*([A-D])/i,
      ];

      let foundCorrect = false;
      for (const pattern of correctPatterns) {
        const answerMatch = line.match(pattern);
        if (answerMatch && currentQuestion.correctAnswer === null) {
          const answerLetter = answerMatch[1].toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(answerLetter)) {
            currentQuestion.correctAnswer = ['A', 'B', 'C', 'D'].indexOf(answerLetter);
            console.log(`🎯 Correct answer: ${answerLetter} (index: ${currentQuestion.correctAnswer})`);
            foundCorrect = true;
            // Don't break - we found the answer, but continue processing this line for other patterns
          }
        }
      }

      // If we found a correct answer on this line, check if we should stop collecting
      if (foundCorrect) {
        // Check if next line starts a new question
        if (i + 1 < lines.length && lines[i + 1].match(/^\d+[\.\)]/)) {
          collectingOptions = false;
        }
      }

      // Stop collecting if we hit another question number
      if (i + 1 < lines.length && lines[i + 1].match(/^\d+[\.\)]/)) {
        collectingOptions = false;
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.options.length >= 2 && currentQuestion.correctAnswer !== null) {
    questions.push(currentQuestion);
    console.log(`✅ Added final question: ${currentQuestion.questionText.substring(0, 50)}...`);
  }

  console.log(`\n✅ FINAL: Parsed ${questions.length} questions from Markdown`);
  
  if (questions.length === 0) {
    console.log('❌ DEBUG: No questions parsed. Let me check the line-by-line processing...');
    console.log('--- LINES DEBUG START ---');
    lines.forEach((line, index) => {
      console.log(`${index}: "${line}"`);
    });
    console.log('--- LINES DEBUG END ---');
  }
  
  return questions;
}
// ——— Traditional PDF parser ———
const parseWithTraditional = async (pdfBuffer) => {
  const data = await pdf(pdfBuffer);
  const text = data.text.replace(/\r\n/g, '\n');
  console.log('📄 Extracted PDF text length:', text.length);

  const blocks = text.split(/(\n\d+[\.\)]|\nQ?\d+[\.\)])/);
  const questions = [];
  let current = null;

  for (let i = 1; i < blocks.length; i += 2) {
    const num = blocks[i].trim();
    const content = blocks[i + 1] || '';
    if (/^(\d+|Q?\d+)[\.\)]/.test(num)) {
      if (current) questions.push(current);
      const qText = content.split(/\n\s*\n|(?=\n[A-Za-z][\.\)])/)[0].trim();
      current = { questionText: qText, options: [] };
    }
    if (current) {
      for (const m of content.matchAll(/(^|\n)([A-Da-d])[\.\)]\s*([^\n]+)/g)) {
        current.options.push(m[3].trim());
      }
    }
  }
  if (current) questions.push(current);

  const answerKey = {};
  const ansSec = text.split(/answers[\s:\-]*\n/i)[1] || '';
  for (const m of ansSec.matchAll(/(\d+)\.\s*([A-Da-d])/g)) {
    answerKey[+m[1]] = m[2].toUpperCase();
  }

  return questions
    .map((q, i) => {
      const letter = answerKey[i + 1];
      if (!letter || q.options.length < 2) return null;
      const idx = ['A', 'B', 'C', 'D'].indexOf(letter);
      if (idx < 0 || idx >= q.options.length) return null;
      return {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: idx,
        marks: 1,
        type: "mcq",
        fromAI: false,
      };
    })
    .filter(Boolean);
};

// ——— Main export: combine ~70% AI + ~30% original questions ———
const parsePDFToQuestions = async (fileBuffer, fileType = 'pdf') => {
  try {
    console.log(`🔄 Starting ${fileType.toUpperCase()} parsing...`);
    
    let all = [];

    if (fileType === 'pdf') {
      all = await parseWithTraditional(fileBuffer);
    } else if (fileType === 'markdown') {
      const markdownText = fileBuffer.toString('utf8');
      all = parseMarkdownToQuestions(markdownText);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!all || all.length === 0) {
      throw new Error(`No questions extracted from ${fileType.toUpperCase()} file`);
    }

    console.log(`✅ Extracted ${all.length} questions from ${fileType.toUpperCase()}`);

    // If we have questions, proceed with AI generation
    const desiredCount = Math.ceil(all.length / 2);
    const shuffled = all.sort(() => Math.random() - 0.5);

    const selectedUnique = [];
    const seen = new Set();
    for (const q of shuffled) {
      if (!seen.has(q.questionText)) {
        seen.add(q.questionText);
        selectedUnique.push(q);
      }
      if (selectedUnique.length >= desiredCount) break;
    }

    if (selectedUnique.length < desiredCount) {
      for (const q of shuffled) {
        if (selectedUnique.length >= desiredCount) break;
        selectedUnique.push(q);
      }
      console.warn(
        `⚠️ Only ${selectedUnique.length} unique found—filled to ${desiredCount} including duplicates.`
      );
    }

    console.log(`✅ Selected ${selectedUnique.length}/${desiredCount} originals`);

    // Ask AI to generate new questions
    const aiGenerated = await callBedrockForQuestions(selectedUnique);

    const totalWanted = selectedUnique.length;
    const aiCount = Math.ceil(totalWanted * 0.7);
    const origCount = totalWanted - aiCount;

    const aiTaken = [];
    const originalTexts = new Set(selectedUnique.map((o) => o.questionText));
    for (const aiQ of aiGenerated) {
      if (aiTaken.length >= aiCount) break;
      if (!originalTexts.has(aiQ.questionText)) {
        aiTaken.push(aiQ);
      }
    }

    const finalOrigCount = origCount + (aiCount - aiTaken.length);
    const origTaken = selectedUnique.slice(0, finalOrigCount);
    const combined = [...aiTaken.slice(0, aiCount), ...origTaken.slice(0, finalOrigCount)];

    console.log(`🔗 Returning ${combined.length} questions total from ${fileType.toUpperCase()}`);
    return combined;
  } catch (err) {
    console.error(`❌ parse${fileType.toUpperCase()}ToQuestions failed:`, err);
    throw err;
  }
};

module.exports = { parsePDFToQuestions };