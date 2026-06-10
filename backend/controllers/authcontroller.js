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
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };
