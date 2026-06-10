const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Only Admins can access this route
router.get('/dashboard', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard!" });
});

// Both Admin and Moderator can access this route
router.get('/content', verifyToken, authorizeRoles('admin', 'moderator'), (req, res) => {
  res.json({ message: "Moderate content here." });
});

module.exports = router;