const mongoose = require("mongoose");

const satQuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'grid_in'],
    required: true,
  },
  questionText: { type: String, required: true },
  passage: { type: String },
  options: [{ type: String }],
  correctAnswer: { 
    type: mongoose.Schema.Types.Mixed, // String or Number
    required: true,
    validate: {
      validator: function(value) {
        if (this.type === 'mcq') {
          return Number.isInteger(value) && value >= 0 && value < this.options.length;
        }
        return true;
      },
      message: 'MCQ correctAnswer must be a valid option index'
    }
  },
  marks: { type: Number, default: 1 },
  questionNumber: { type: Number }
}, { _id: true });

const satAssessmentSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  satTitle: { type: String, required: true },
  sectionType: {
    type: String,
    enum: ['reading', 'writing', 'math_no_calc', 'math_calc', 'all'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'very hard'],
    required: true
  },
  questions: [satQuestionSchema],
  fileUrl: { type: String },
  isApproved: { type: Boolean, default: false },

  // 🆕 ENHANCEMENTS
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft"
  },
  tags: [{ type: String }], // e.g., ["SAT Math", "Critical Reading"]
  estimatedTime: { type: Number }, // minutes
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },

  createdAt: { type: Date, default: Date.now },
});

satAssessmentSchema.pre('save', function(next) {
  this.questions.forEach((question, index) => {
    if (question.type === 'mcq') {
      if (typeof question.correctAnswer !== 'number' || 
          question.correctAnswer < 0 || 
          question.correctAnswer >= question.options.length) {
        throw new Error(
          `Question ${index + 1} has invalid correctAnswer index (${question.correctAnswer})`
        );
      }
    }
  });
  next();
});

module.exports = mongoose.model("SatAssessment", satAssessmentSchema);
