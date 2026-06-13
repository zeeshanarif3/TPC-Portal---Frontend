const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pointOfContact: { type: String },
  location: { type: String },
  moderatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('College', CollegeSchema);
