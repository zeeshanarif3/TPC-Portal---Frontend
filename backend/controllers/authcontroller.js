const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    // Ensure the user is active
    if (user.active === false) {
      return res.status(403).json({ message: "Your account is inactive. Please contact the administrator." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // send token and role back to the frontend
    res.status(200).json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role // redirect frontend based on this
      }
    });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

// Admin API to change the active field for a user
const updateUserActiveStatus = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  if (active === undefined) {
    return res.status(400).json({ message: "Active status is required" });
  }

  if (typeof active !== 'boolean') {
    return res.status(400).json({ message: "Active status must be a boolean" });
  }

  try {
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    // Admins cannot be inactive, and active state management is only for moderator and trainer users.
    if (userToUpdate.role === 'admin') {
      return res.status(400).json({ message: "Admin accounts cannot be set to inactive" });
    }

    if (userToUpdate.role !== 'moderator' && userToUpdate.role !== 'trainer') {
      return res.status(400).json({ message: "Active status can only be managed for moderator and trainer users" });
    }

    userToUpdate.active = active;
    await userToUpdate.save();

    res.status(200).json({
      message: `User active status updated to ${active} successfully`,
      user: {
        id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        active: userToUpdate.active
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin API to get all users (moderators and trainers)
const getUsersForAdmin = async (req, res) => {
  try {
    // Fetch moderator and trainer users for admin management
    const users = await User.find({ role: { $in: ['moderator', 'trainer'] } }, '-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, updateUserActiveStatus, getUsersForAdmin };

