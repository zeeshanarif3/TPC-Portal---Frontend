const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getUpcomingScheduleByCollege,
  appendSlotsViaCSV
} = require('../controllers/scheduleController');

// Middleware for admin and moderator
const adminModeratorMiddleware = authorizeRoles('admin', 'moderator');
// Middleware for GET schedules route (allows admin, moderator, trainer)
const getScheduleMiddleware = authorizeRoles('admin', 'moderator', 'trainer');

// Admin and Moderator Routes for Schedules
router.get('/upcoming', verifyToken, adminModeratorMiddleware, getUpcomingScheduleByCollege);
router.post('/', verifyToken, adminModeratorMiddleware, createSchedule);
router.post('/append-slots-csv', verifyToken, adminModeratorMiddleware, appendSlotsViaCSV);
router.get('/', verifyToken, getScheduleMiddleware, getAllSchedules);
router.get('/:id', verifyToken, adminModeratorMiddleware, getScheduleById);
router.put('/:id', verifyToken, adminModeratorMiddleware, updateSchedule);
router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteSchedule);
// New route for upcoming schedule by college

module.exports = router;
