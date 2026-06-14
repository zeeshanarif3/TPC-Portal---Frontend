const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createAttendance,
  updateAttendance,
  getAnalytics,
  getUpcomingClasses
} = require('../controllers/attendanceController');

// Trainer middleware
const trainerMiddleware = authorizeRoles('trainer');
// Moderator middleware
const moderatorMiddleware = authorizeRoles('moderator');

// Trainer Routes for Attendance
router.post('/', verifyToken, trainerMiddleware, createAttendance);
router.put('/', verifyToken, trainerMiddleware, updateAttendance);
router.get('/upcoming-classes', verifyToken, trainerMiddleware, getUpcomingClasses);

// Moderator Route for Analytics
router.get('/analytics', verifyToken, moderatorMiddleware, getAnalytics);

module.exports = router;
