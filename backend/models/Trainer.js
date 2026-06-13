const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  speciality: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Trainer', TrainerSchema);
