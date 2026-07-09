const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
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
  slots: {
    type: Map,
    of: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
      roomNo: {type: String, required: true},
      topic: {type: String}
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
