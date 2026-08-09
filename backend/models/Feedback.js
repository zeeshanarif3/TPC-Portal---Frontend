const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skeletonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentSkeleton',
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comments: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
