const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  selectedOptionIndex: {
    type: Number,
    required: true
  }
}, { _id: false });

const AssessmentSubmissionSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: {
    type: [AnswerSchema],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Enforce single attempt per student per assessment
AssessmentSubmissionSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentSubmission', AssessmentSubmissionSchema);
