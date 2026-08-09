const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const { updateUserActiveStatus, getUsersForAdmin, createAdmin } = require('../controllers/authcontroller');

// Only Admins can access this route
router.get('/dashboard', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard!" });
});

// Both Admin and Moderator can access this route
router.get('/content', verifyToken, authorizeRoles('admin', 'moderator'), (req, res) => {
  res.json({ message: "Moderate content here." });
});

// Admin APIs for user activation/deactivation status management
router.get('/users', verifyToken, authorizeRoles('admin'), getUsersForAdmin);
router.patch('/users/:id/active', verifyToken, authorizeRoles('admin'), updateUserActiveStatus);

// Admin API to register/add other admins
router.post('/admins', verifyToken, authorizeRoles('admin'), createAdmin);

module.exports = router;
