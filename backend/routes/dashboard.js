const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const { getDashboardStats } = require('../controllers/dashboardController');

// Middleware for admin and moderator
const adminModeratorMiddleware = authorizeRoles('admin', 'moderator');

// Dashboard route for stats
router.get('/stats', verifyToken, adminModeratorMiddleware, getDashboardStats);

module.exports = router;
