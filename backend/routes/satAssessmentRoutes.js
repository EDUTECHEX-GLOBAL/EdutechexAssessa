// backend/routes/satAssessmentRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middlewares/authMiddleware");

// import controllers
const {
  uploadSATAssessment,
  getMySATAssessments,
  deleteSATAssessment,
  getSatAssessmentCount,
  getAllSATAssessmentsForStudents,
  getSatAssessmentForAttempt,
  getSatAssessmentSubmissions,
  submitSatAssessment,
  getMySatSubmissions,
  getMySATAssessmentsForReview,
  approveSATAssessment,
  getSatStudentProgress,
  getMySatProgress,

} = require("../controllers/satAssessmentController");

// Use in-memory storage since you're parsing the buffer directly
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/sat-assessments/upload
router.post("/upload", protect, upload.single("file"), uploadSATAssessment);
// POST submission route (must be placed before `/:id` routes to avoid conflicts)
router.post("/:id/submit", protect, submitSatAssessment);

// GET all SAT assessments uploaded by a teacher (review panel)
router.get("/teacher/all", protect, getMySATAssessmentsForReview);

// Teacher progress tracking for SAT
router.get("/teacher/student-progress", protect, getSatStudentProgress);

// Student progress (detailed rows for SatProgress.jsx)
router.get("/my-progress", protect, getMySatProgress);



// PATCH approve SAT assessment
router.patch("/:id/approve", protect, approveSATAssessment);


// GET /api/sat-assessments/library
router.get("/library", protect, getMySATAssessments);
router.get("/library/count", protect, getSatAssessmentCount);
router.get("/all", protect, getAllSATAssessmentsForStudents);

// GET /api/sat-assessments/:id/attempt (Student attempts SAT assessment)
router.get("/:id/attempt", protect, getSatAssessmentForAttempt);
// Teacher views all SAT submissions for an assessment
router.get("/:id/submissions", protect, getSatAssessmentSubmissions);
router.get("/my-submissions", protect, getMySatSubmissions);



// DELETE /api/sat-assessments/:id
router.delete("/:id", protect, deleteSATAssessment);

module.exports = router;
