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
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  presentStudents: [{ type: String }],
  headCount: { type: Number }
}, { timestamps: true });

// Index to prevent duplicate attendance for the same slot (defined by course, session, date, startTime, endTime, trainerId)
AttendanceSchema.index({ courseId: 1, sessionId: 1, date: 1, startTime: 1, endTime: 1, trainerId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);