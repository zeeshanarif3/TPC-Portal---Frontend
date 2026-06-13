const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  trainerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trainer',
    required: true
  },
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Session',
    required: true
  },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Contract', ContractSchema);
