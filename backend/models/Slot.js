const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  roomNo: { type: String, required: true },
  topic: { type: String },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled',
    required: true
  },
  attendanceTaken: { type: Boolean, default: false },
  presentStudents: [{ type: String }], 
  headCount: { type: Number, default: 0 },
  feedback: { type: String }
}, { timestamps: true });

SlotSchema.index({ date: 1, startTime: 1, roomNo: 1 }, { unique: true });
SlotSchema.index({ date: 1, startTime: 1, trainerId: 1 }, { unique: true });

module.exports = mongoose.model('Slot', SlotSchema);
