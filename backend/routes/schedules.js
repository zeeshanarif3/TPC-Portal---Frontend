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
  getUpcomingScheduleByCollege
} = require('../controllers/scheduleController');

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// Admin Routes for Schedules
router.post('/', verifyToken, adminMiddleware, createSchedule);
router.get('/', verifyToken, adminMiddleware, getAllSchedules);
router.get('/:id', verifyToken, adminMiddleware, getScheduleById);
router.put('/:id', verifyToken, adminMiddleware, updateSchedule);
router.delete('/:id', verifyToken, adminMiddleware, deleteSchedule);
// New route for upcoming schedule by college
router.get('/upcoming', verifyToken, adminMiddleware, getUpcomingScheduleByCollege);

module.exports = router;
