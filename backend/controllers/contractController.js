const Contract = require('../models/Contract');
const Trainer = require('../models/Trainer');
const Session = require('../models/Session');

// Create a new contract
exports.createContract = async (req, res) => {
  try {
    const { trainerId, sessionId, startDate, endDate, status } = req.body;

    // Verify that the trainer exists
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(400).json({ message: 'Trainer not found' });
    }

    // Verify that the session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(400).json({ message: 'Session not found' });
    }

    // Set default startDate and endDate if not provided
    const finalStartDate = startDate ? new Date(startDate) : session.startDate;
    const finalEndDate = endDate ? new Date(endDate) : session.endDate;

    const contract = new Contract({
      trainerId,
      sessionId,
      startDate: finalStartDate,
      endDate: finalEndDate,
      status: status || 'active'
    });
    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all contracts
exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('trainerId', 'name speciality')
      .populate('sessionId', 'startDate endDate');
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get contract by ID
exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('trainerId', 'name speciality')
      .populate('sessionId', 'startDate endDate');
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update contract by ID
exports.updateContract = async (req, res) => {
  try {
    const { trainerId, sessionId, startDate, endDate, status } = req.body;

    // If trainerId is provided, verify it exists
    if (trainerId) {
      const trainer = await Trainer.findById(trainerId);
      if (!trainer) {
        return res.status(400).json({ message: 'Trainer not found' });
      }
    }

    // If sessionId is provided, verify it exists
    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(400).json({ message: 'Session not found' });
      }
    }

    // If startDate or endDate not provided, we might need to get the session's dates
    // But if sessionId is provided, we can use its dates; otherwise, we keep existing
    let finalStartDate = startDate;
    let finalEndDate = endDate;
    if (sessionId && (!startDate || !endDate)) {
      const session = await Session.findById(sessionId);
      if (!startDate) finalStartDate = session.startDate;
      if (!endDate) finalEndDate = session.endDate;
    } else if (!sessionId) {
      // If sessionId not provided, we need the existing contract's session to get defaults
      const existingContract = await Contract.findById(req.params.id).populate('sessionId');
      if (!startDate) finalStartDate = existingContract.sessionId.startDate;
      if (!endDate) finalEndDate = existingContract.sessionId.endDate;
    }

    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      { trainerId, sessionId, startDate: finalStartDate, endDate: finalEndDate, status },
      { new: true, runValidators: true }
    )
    .populate('trainerId', 'name speciality')
    .populate('sessionId', 'startDate endDate');

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete contract by ID
exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(200).json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
