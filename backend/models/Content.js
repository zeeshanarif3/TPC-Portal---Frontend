const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  skeletonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentSkeleton',
    required: true
  },
  classNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);
