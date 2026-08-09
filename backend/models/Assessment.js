const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(arr) {
        return arr && arr.length >= 2;
      },
      message: 'Options must have at least 2 items.'
    }
  },
  correctOptionIndex: {
    type: Number,
    required: true
  },
  marks: {
    type: Number,
    default: 1
  }
}, { _id: false });

const AssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  skeletonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentSkeleton',
    default: null
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: {
    type: [QuestionSchema],
    required: true
  },
  durationMinutes: {
    type: Number,
    default: null
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  deadline: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', AssessmentSchema);
