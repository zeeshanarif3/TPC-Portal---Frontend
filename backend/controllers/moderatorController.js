const Moderator = require('../models/Moderator');
const College = require('../models/College');
const Session = require('../models/Session');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create a new moderator (also creates the user account)
exports.createModerator = async (req, res) => {
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

    // Create user with role moderator
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'moderator'
    });
    await user.save();

    // Create moderator profile
    const moderator = new Moderator({
      userId: user._id,
      name, // moderator's name (could be same as user's name)
      speciality
    });
    await moderator.save();

    res.status(201).json({ user, moderator });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all moderators
exports.getAllModerators = async (req, res) => {
  try {
    const moderators = await Moderator.find().populate('userId', 'name email');
    res.status(200).json(moderators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get moderator by ID
exports.getModeratorById = async (req, res) => {
  try {
    const moderator = await Moderator.findById(req.params.id).populate('userId', 'name email');
    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found' });
    }
    res.status(200).json(moderator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update moderator by ID
exports.updateModerator = async (req, res) => {
  try {
    const { name, speciality } = req.body;

    const moderator = await Moderator.findByIdAndUpdate(
      req.params.id,
      { name, speciality },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found' });
    }
    res.status(200).json(moderator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete moderator by ID
exports.deleteModerator = async (req, res) => {
  try {
    const moderator = await Moderator.findById(req.params.id);
    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found' });
    }

    // Delete the associated user account
    await User.findByIdAndDelete(moderator.userId);
    // Delete the moderator profile
    await Moderator.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Moderator and associated user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
