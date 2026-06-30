const Trainer = require('../models/Trainer');
const College = require('../models/College');
const Session = require('../models/Session');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create a new trainer (also creates the user account)
exports.createTrainer = async (req, res) => {
  try {
    const { name, email, password, speciality } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with role trainer
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'trainer'
    });
    await user.save();

    // Create trainer profile
    const trainer = new Trainer({
      userId: user._id,
      name, // trainer's name (could be same as user's name)
      speciality
    });
    await trainer.save();

    res.status(201).json({ user, trainer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all trainers
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().populate('userId', 'name email');
    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trainer by ID
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate('userId', 'name email');
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update trainer by ID
exports.updateTrainer = async (req, res) => {
  try {
    const { name, speciality } = req.body;

    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { name, speciality },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete trainer by ID
exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Delete the associated user account
    await User.findByIdAndDelete(trainer.userId);
    // Delete the trainer profile
    await Trainer.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Trainer and associated user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get trainers by collegeId (those with active contracts in the college's sessions)
exports.getTrainersByCollege = async (req, res) => {
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
    });

    // Extract trainer details (avoid duplicates)
    const trainerMap = new Map();
    contracts.forEach(contract => {
      const trainerId = contract.trainerId._id.toString();
      if (!trainerMap.has(trainerId)) {
        trainerMap.set(trainerId, {
          _id: trainerId,
          name: contract.trainerId.name,
          speciality: contract.trainerId.speciality,
          user: {
            _id: contract.trainerId.userId._id,
            name: contract.trainerId.userId.name,
            email: contract.trainerId.userId.email
          }
        });
      }
    });

    const trainers = Array.from(trainerMap.values());
    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
