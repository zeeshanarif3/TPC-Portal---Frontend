const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  collegeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'College',
    required: true
  },
  courseCode: { type: String, required: true }
}, { timestamps: true });

// Ensure courseCode is unique per college
CourseSchema.index({ collegeId: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model('Course', CourseSchema);
