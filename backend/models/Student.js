const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  name: { type: String, required: true },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: true
  }
}, { timestamps: true });

// Ensure rollNumber is unique per course
StudentSchema.index({ courseId: 1, rollNumber: 1 }, { unique: true });

module.exports = mongoose.model('Student', StudentSchema);
