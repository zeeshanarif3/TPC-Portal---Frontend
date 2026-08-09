const mongoose = require('mongoose');

const ContentSkeletonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    default: null
  },
  classNumber: {
    type: Number,
    required: true
  },
  expectedFormat: {
    type: String,
    enum: ['pdf', 'video', 'doc', 'link', 'live'],
    default: 'pdf'
  },
  timeline: {
    scheduledDate: { type: Date, default: null },
    deadline: { type: Date, default: null }
  },
  metadata: {
    topic: { type: String, default: '' },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    durationMinutes: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ContentSkeleton', ContentSkeletonSchema);
