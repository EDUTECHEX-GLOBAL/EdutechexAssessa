const SatAssessment = require("../models/webapp-models/satAssessmentModel");
const { parseSATAssessment, parseSATAssessmentCombined } = require("../utils/satParser");
const { uploadToS3, getSignedUrl, deleteFromS3 } = require("../config/s3Upload");
const SatSubmission = require("../models/webapp-models/satSubmissionModel");
const SatFeedback = require("../models/webapp-models/satFeedbackModel");
const { generateScoreReportPDF } = require("../utils/scoreReport");
const sendEmail = require("../utils/mailer");
const Userwebapp = require("../models/webapp-models/userModel");



// Upload SAT Assessment
exports.uploadSATAssessment = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { satTitle, sectionType } = req.body;

    if (!req.file || !satTitle || !sectionType) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    console.log("📥 Uploading SAT file for:", satTitle);

    // Determine file type
    const fileType = req.file.mimetype === 'text/markdown' || req.file.originalname.endsWith('.md') ? 'markdown' : 'pdf';

    // Upload to S3
    const { key } = await uploadToS3(req.file, "sat");
    console.log("📤 S3 Upload Key:", key);

    // Respond immediately
    res.status(202).json({
      message: `SAT assessment uploaded. Generating difficulty variants from ${fileType.toUpperCase()} in the background.`,
      satTitle,
      sectionType,
      fileKey: key,
      fileType
    });

    // Background processing with file type support
    (async () => {
      const difficulties = ["easy", "medium", "hard", "very hard"];

      for (const difficulty of difficulties) {
        console.log(`🔄 [BG] Generating ${fileType.toUpperCase()} difficulty: ${difficulty}`);
        let questions = [];
        let attempts = 0;

        while (questions.length === 0 && attempts < 3) {
          attempts++;
          try {
            if (sectionType === "all") {
              questions = await parseSATAssessmentCombined(req.file.buffer, difficulty, fileType);
            } else {
              questions = await parseSATAssessment(req.file.buffer, sectionType, difficulty, fileType);
            }
          } catch (err) {
            console.error(`❌ [BG] Error generating ${difficulty} (attempt ${attempts}):`, err.message);
          }
        }

        if (!questions || questions.length === 0) {
          console.error(`❌ [BG] Skipping ${difficulty} — no valid questions generated`);
          continue;
        }

        try {
          const assessment = new SatAssessment({
            teacherId,
            satTitle,
            sectionType,
            difficulty,
            questions,
            fileUrl: key,
            isApproved: false,
            fileType // ✅ Add file type tracking
          });

          await assessment.save();
          console.log(`✅ [BG] Saved ${difficulty} with ${questions.length} questions from ${fileType.toUpperCase()}`);
        } catch (saveErr) {
          console.error(`❌ [BG] Failed to save ${difficulty} assessment:`, saveErr.message);
        }
      }

      console.log(`🏁 [BG] ${fileType.toUpperCase()} generation completed for: ${satTitle}`);
    })().catch(e => console.error("❌ [BG] Uncaught generation error:", e));

  } catch (err) {
    console.error("❌ SAT upload error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error during SAT upload." });
    }
  }
};

// Get all SAT assessments by logged-in teacher
exports.getMySATAssessments = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const assessments = await SatAssessment.find({ teacherId }).sort({ createdAt: -1 });

    const assessmentsWithUrls = await Promise.all(
      assessments.map(async (a) => ({
        ...a._doc,
        signedUrl: a.fileUrl ? await getSignedUrl(a.fileUrl) : null,
      }))
    );

    res.json(assessmentsWithUrls);
  } catch (error) {
    console.error("❌ Error fetching SAT assessments:", error);
    res.status(500).json({ message: "Failed to fetch SAT assessments" });
  }
};

// ✅ Delete SAT Assessment
// ✅ Delete SAT Assessment
exports.deleteSATAssessment = async (req, res) => {
  try {
    const assessment = await SatAssessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: "SAT assessment not found" });
    }

    if (assessment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this SAT assessment" });
    }

    // Delete from S3 if exists
    if (assessment.fileUrl) {
      try {
        await deleteFromS3(assessment.fileUrl);
      } catch (err) {
        console.warn("⚠️ Failed to delete file from S3:", err.message);
      }
    }

    // ✅ Also delete all related submissions
    await SatSubmission.deleteMany({ assessmentId: assessment._id });

    // Finally delete the assessment
    await assessment.deleteOne();

    res.json({ message: "SAT assessment and related submissions deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("❌ Error deleting SAT assessment:", err);
    res.status(500).json({ message: "Failed to delete SAT assessment" });
  }
};

// ✅ Get SAT Assessment Count for Dashboard
exports.getSatAssessmentCount = async (req, res) => {
  try {
    const count = await SatAssessment.countDocuments({ teacherId: req.user._id });
    res.json({ count });
  } catch (error) {
    console.error("❌ Error fetching SAT assessment count:", error);
    res.status(500).json({ message: "Failed to fetch SAT assessment count" });
  }
};

// ✅ Get all SAT assessments (for students)
exports.getAllSATAssessmentsForStudents = async (req, res) => {
  try {
    // ✅ Step 1: Ensure only students can access
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can access this route." });
    }

    // ✅ Step 2: Fetch only APPROVED assessments
    const assessments = await SatAssessment.find({ isApproved: true }).sort({ createdAt: -1 });

    const studentId = req.user._id;
    const submissions = await SatSubmission.find({ studentId });

    // ✅ Step 3: Combine assessments with submission and signed S3 URL
    const assessmentsWithSubmission = await Promise.all(
      assessments.map(async (a) => {
        const submission = submissions.find(
          (s) => s.assessmentId.toString() === a._id.toString()
        );
        return {
          ...a._doc,
          submission: submission
            ? {
                score: submission.score,
                totalMarks: submission.totalMarks,
                percentage: submission.percentage,
              }
            : null,
          signedUrl: a.fileUrl ? await getSignedUrl(a.fileUrl) : null,
        };
      })
    );

    res.json(assessmentsWithSubmission);
  } catch (err) {
    console.error("❌ Error fetching SAT assessments for students:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to fetch SAT assessments" });
    }
  }
};


// ✅ Get one SAT assessment for attempt (no restrictions on correct answer)
exports.getSatAssessmentForAttempt = async (req, res) => {
  try {
    const satAssessment = await SatAssessment.findById(req.params.id);

    if (!satAssessment) {
      return res.status(404).json({ message: "SAT assessment not found" });
    }

    res.status(200).json({
      _id: satAssessment._id,
      satTitle: satAssessment.satTitle,
      sectionType: satAssessment.sectionType,
      timeLimit: 30, // or customize per sectionType
      questions: satAssessment.questions.map(q => ({
        questionText: q.questionText,
        passage: q.passage || null,
        options: q.options || [],
        type: q.type,
        marks: q.marks || 1,
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching SAT assessment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all submissions for a SAT assessment (Teacher view)
exports.getSatAssessmentSubmissions = async (req, res) => {
  try {
    const satAssessment = await SatAssessment.findById(req.params.id);
    if (!satAssessment) {
      return res.status(404).json({ message: "SAT assessment not found" });
    }

    // Only the teacher who created the SAT assessment can view
    if (satAssessment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view submissions" });
    }

    const submissions = await SatSubmission.find({
      assessmentId: req.params.id,
    }).populate("studentId", "name email");

    res.status(200).json({
      assessment: {
        _id: satAssessment._id,
        satTitle: satAssessment.satTitle,
        sectionType: satAssessment.sectionType,
        totalQuestions: satAssessment.questions.length,
        totalMarks: satAssessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      },
      submissions,
    });
  } catch (err) {
    console.error("❌ Error fetching SAT submissions:", err);
    res.status(500).json({ message: "Internal server error while fetching submissions" });
  }
};

// @desc    Submit answers to a SAT assessment
// @route   POST /api/sat-assessments/:id/submit
// @access  Private (Student)
exports.submitSatAssessment = async (req, res) => {
  try {
    const { answers, timeTaken, mode = "test" } = req.body;
    const studentId = req.user._id;

    // Validate input
    if (!Array.isArray(answers) || typeof timeTaken !== 'number' || timeTaken < 0) {
      return res.status(400).json({ 
        message: "Invalid request format" 
      });
    }

    const assessment = await SatAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "SAT assessment not found" });
    }

    // ✅ Validation for assessment questions
    const invalidQuestions = assessment.questions.filter((q, i) => {
      if (q.type === 'mcq') {
        return (
          typeof q.correctAnswer !== 'number' ||
          q.correctAnswer < 0 ||
          q.correctAnswer >= (q.options?.length || 0)
        );
      }
      return false;
    });

    if (invalidQuestions.length > 0) {
      return res.status(422).json({
        message: "Assessment contains invalid questions",
        invalidCount: invalidQuestions.length
      });
    }

    if (answers.length !== assessment.questions.length) {
      return res.status(400).json({ 
        message: `Expected ${assessment.questions.length} answers, received ${answers.length}` 
      });
    }

    let score = 0;
    const responses = [];
    const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    // Answer processing
    assessment.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      const questionMarks = question.marks || 1;
      let isCorrect = false;

      if (question.type === 'mcq') {
        const studentAns = parseInt(studentAnswer);
        if (!isNaN(studentAns) && studentAns >= 0 && studentAns < question.options.length) {
          isCorrect = studentAns === parseInt(question.correctAnswer);
        }
      } else {
        const normalize = (ans) => {
          if (ans === null || ans === undefined) return '';
          return String(ans)
            .trim()
            .toLowerCase()
            .replace(/[^0-9\.\/\-]/g, '')
            .replace(/^0+(\d)/, '$1')
            .replace(/(\.\d*?)0+$/, '$1')
            .replace(/\.$/, '');
        };
        isCorrect = normalize(studentAnswer) === normalize(question.correctAnswer);
      }

      if (isCorrect) score += questionMarks;

      responses.push({
        questionText: question.questionText,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
        studentAnswer,
        isCorrect,
        marks: questionMarks,
        type: question.type
      });
    });

    const percentage = (score / totalMarks) * 100;

    const submission = new SatSubmission({
  studentId,
  assessmentId: assessment._id,
  responses,
  score,
  totalMarks,
  percentage: parseFloat(percentage.toFixed(2)),
  timeTaken,
  proctoringData: {
    mode: mode, // Add this line
    violationCount: 0,
    sessionDuration: timeTaken
  }
});

await submission.save();

// ADD THIS AFTER submission save:
const user = await Userwebapp.findById(studentId);
await user.syncTotalAttempts();
   
// ✅ Generate PDF + Send Email

try {
  const student = await User.findById(studentId).select("name email");
  if (student && student.email) {
    const pdfBuffer = await generateScoreReportPDF(
      submission,
      student,
      assessment,
      "sat"
    );

    await sendEmail.sendScoreReportEmail(
      student.email,
      student.name || "Student",
      pdfBuffer,
      "sat"
    );
  } else {
    console.warn("⚠️ Student email not found; skipping SAT score report send.");
  }
} catch (err) {
  console.error("❌ Failed to generate/send SAT score report:", err);
  // Don’t throw → keep submission success even if email fails
}

    res.status(200).json({ 
      success: true,
      score,
      totalMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      submissionId: submission._id
    });

  } catch (err) {
    console.error("SAT submission error:", err);
    res.status(500).json({ 
      message: "Failed to submit SAT assessment",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ✅ Get all SAT submissions for current student
exports.getMySatSubmissions = async (req, res) => {
  try {
    const studentId = req.user._id;
    const submissions = await SatSubmission.find({ studentId }).select("assessmentId");
    const completedAssessmentIds = submissions.map(s => s.assessmentId.toString());
    res.json({ completed: completedAssessmentIds });
  } catch (err) {
    console.error("❌ Failed to fetch student's SAT submissions:", err);
    res.status(500).json({ message: "Failed to fetch SAT submissions" });
  }
};
// @desc    Get all SAT assessments uploaded by the current teacher
// @route   GET /api/sat-assessments/teacher/all?status=pending|approved|all
// @access  Private (Teacher only)
exports.getMySATAssessmentsForReview = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { status } = req.query;

    let filter = { teacherId };

    if (status === "pending") {
      filter.isApproved = false;
    } else if (status === "approved") {
      filter.isApproved = true;
    }

    const assessments = await SatAssessment.find(filter);
    res.json(assessments);
  } catch (err) {
    console.error("Error fetching SAT assessments for review", err);
    res.status(500).json({ message: "Failed to fetch SAT assessments" });
  }
};
// @desc    Approve a specific SAT assessment
// @route   PATCH /api/sat-assessments/:id/approve
// @access  Private (Teacher only)
exports.approveSATAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await SatAssessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "SAT Assessment not found" });
    }

    assessment.isApproved = true;
    await assessment.save();

    res.json({ message: "SAT Assessment approved successfully" });
  } catch (err) {
    console.error("Error approving SAT assessment", err);
    res.status(500).json({ message: "Error approving SAT assessment" });
  }
};
// @desc    Get SAT student progress for teacher dashboard
// @route   GET /api/sat-assessments/teacher/student-progress
// @access  Private (Teacher only)
exports.getSatStudentProgress = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // All submissions for this teacher’s SAT assessments
    const submissions = await SatSubmission.find()
      .populate({
        path: "assessmentId",
        match: { teacherId },
        select: "satTitle sectionType teacherId",
      })
      .populate({
        path: "studentId",
        select: "name class",
      });

    // Keep only this teacher’s
    const filtered = submissions.filter((s) => s.assessmentId);

    // 🔎 Build sets to query feedbacks (Feedback schema has studentId + assessmentId)
    const studentIds = filtered.map((s) => s.studentId?._id).filter(Boolean);
    const assessmentIds = filtered.map((s) => s.assessmentId?._id).filter(Boolean);

    // ✅ Fetch SAT-specific feedbacks instead of generic feedback
    const existingFeedbacks = await SatFeedback.find({
      studentId: { $in: studentIds },
      assessmentId: { $in: assessmentIds },
    }).select("studentId assessmentId");


    // Fast lookup: studentId-assessmentId -> true
    const sentSet = new Set(
      existingFeedbacks.map(
        (f) => `${f.studentId.toString()}-${f.assessmentId.toString()}`
      )
    );

    const formatted = filtered.map((s) => {
      const perc =
        s.percentage ??
        (s.totalMarks ? Number(((s.score / s.totalMarks) * 100).toFixed(2)) : 0);

      const sentKey = `${s.studentId?._id?.toString() || ""}-${s.assessmentId?._id?.toString() || ""}`;
      const feedbackSent = sentSet.has(sentKey);

      return {
        studentName: s.studentId?.name || "Unknown",
        className: s.studentId?.class || "Unknown",
        assessmentTitle: s.assessmentId?.satTitle || "Untitled",
        sectionType: s.assessmentId?.sectionType || "General",
        score: s.score ?? 0,
        totalMarks: s.totalMarks ?? 0,
        percentage: perc,
        submittedDate: s.submittedAt || s.createdAt || null,
        timeTaken: s.timeTaken,
        feedbackSent,                              // ✅ reliable
        submissionId: s._id,
        studentId: s.studentId?._id,
        assessmentId: s.assessmentId?._id,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching SAT student progress:", err);
    res.status(500).json({ message: "Failed to fetch SAT student progress" });
  }
};
// ✅ Get detailed SAT progress for the logged-in student
exports.getMySatProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

  const submissions = await SatSubmission.find({ studentId })
     .populate("assessmentId", "satTitle sectionType difficulty")
     .populate("studentId", "name email")  // ✅ add this
     .sort({ createdAt: -1 });


const rows = submissions
  .filter(s => s.assessmentId) // 🚀 ignore orphan submissions
  .map((s) => ({
    _id: s._id,
    assessmentTitle: s.assessmentId?.satTitle || "Untitled",
    sectionType: s.assessmentId?.sectionType || "Unknown",
    difficulty: s.assessmentId?.difficulty || "—",
    score: s.score ?? 0,
    totalMarks: s.totalMarks ?? 0,
    percentage: typeof s.percentage === "number" ? s.percentage : 0,
    submittedDate: s.submittedAt || s.createdAt || null,
    timeTaken: s.timeTaken ?? 0,
    studentName: s.studentId?.name || "Unknown",   
    studentEmail: s.studentId?.email || "Unknown", 
  }));

    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch student's SAT progress:", err);
    res.status(500).json({ message: "Failed to fetch SAT progress" });
  }
};
