const Contract = require('../models/Contract');
const Trainer = require('../models/Trainer');
const Session = require('../models/Session');
const College = require('../models/College');

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
// Get contract expiry information for a college
exports.getContractExpiryByCollege = async (req, res) => {
  try {
    const { collegeId } = req.query;
    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Get sessions for this college
    const sessions = await Session.find({ collegeId });
    const sessionIds = sessions.map(s => s._id);

    // Get active contracts for these sessions
    const contracts = await Contract.find({ 
      sessionId: { $in: sessionIds },
      status: 'active'
    }).populate({
      path: 'trainerId',
      populate: { path: 'userId', select: 'name email' }
    }).populate({
      path: 'sessionId',
      select: 'startDate endDate'
    });

    // Format the response with expiry info
    const today = new Date();
    const contractExpiry = contracts.map(contract => {
      const endDate = contract.sessionId.endDate || contract.endDate;
      const daysUntilExpiry = endDate ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : null;

      return {
        _id: contract._id,
        trainer: {
          _id: contract.trainerId._id,
          name: contract.trainerId.name,
          speciality: contract.trainerId.speciality,
          user: {
            _id: contract.trainerId.userId._id,
            name: contract.trainerId.userId.name,
            email: contract.trainerId.userId.email
          }
        },
        session: {
          _id: contract.sessionId._id,
          startDate: contract.sessionId.startDate,
          endDate: contract.sessionId.endDate
        },
        contractDates: {
          startDate: contract.startDate,
          endDate: contract.endDate
        },
        status: contract.status,
        daysUntilExpiry: daysUntilExpiry,
        isExpired: daysUntilExpiry !== null && daysUntilExpiry < 0
      };
    });

    res.status(200).json(contractExpiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
