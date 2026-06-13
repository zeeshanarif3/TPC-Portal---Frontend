const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: true
  },
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Session',
    required: true
  },
  date: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  presentStudents: [{ type: String }],
  headCount: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
