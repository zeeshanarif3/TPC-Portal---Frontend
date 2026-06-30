const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createAttendance,
  updateAttendance,
  getAnalytics,
  getUpcomingClasses,
  getAttendanceChartByCollege,
  getSubjectDistributionByCollege,
  getAttendanceByCollegeAndSession
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

// New routes for college-specific data (accessible by admin and moderator)
const adminModeratorMiddleware = authorizeRoles('admin', 'moderator');
router.get('/chart', verifyToken, adminModeratorMiddleware, getAttendanceChartByCollege);
router.get('/distribution', verifyToken, adminModeratorMiddleware, getSubjectDistributionByCollege);
router.get('/college/:collegeId/session/:sessionId', verifyToken, adminModeratorMiddleware, getAttendanceByCollegeAndSession);

module.exports = router;
