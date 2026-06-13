const College = require('../models/College');
const User = require('../models/User');

// Create a new college
exports.createCollege = async (req, res) => {
  try {
    const { name, pointOfContact, location, moderatorId } = req.body;

    // Verify that the moderatorId refers to a user with role 'moderator'
    const moderator = await User.findById(moderatorId);
    if (!moderator || moderator.role !== 'moderator') {
      return res.status(400).json({ message: 'Invalid moderator ID or user is not a moderator' });
    }

    const college = new College({ name, pointOfContact, location, moderatorId });
    await college.save();
    res.status(201).json(college);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'College with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await College.find().populate('moderatorId', 'name email');
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get college by ID
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id).populate('moderatorId', 'name email');
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.status(200).json(college);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update college by ID
exports.updateCollege = async (req, res) => {
  try {
    const { name, pointOfContact, location, moderatorId } = req.body;

    // If moderatorId is provided, verify it
    if (moderatorId) {
      const moderator = await User.findById(moderatorId);
      if (!moderator || moderator.role !== 'moderator') {
        return res.status(400).json({ message: 'Invalid moderator ID or user is not a moderator' });
      }
    }

    const college = await College.findByIdAndUpdate(
      req.params.id,
      { name, pointOfContact, location, moderatorId },
      { new: true, runValidators: true }
    ).populate('moderatorId', 'name email');

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.status(200).json(college);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'College with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete college by ID
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.status(200).json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
