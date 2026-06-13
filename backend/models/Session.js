const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  collegeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'College',
    required: true
  },
  courseIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course'
  }],
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
