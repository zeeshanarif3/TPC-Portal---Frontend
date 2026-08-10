const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createSlot,
  getAllSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
  getUpcomingSlotsByCollege,
  appendSlotsViaCSV,
  updateTopicAndFeedback,
  getUpcomingClasses,
  getUpcomingStudentClasses,
  submitAttendance,
  getAttendanceById,
  getAnalytics,
  getAttendanceChartByCollege,
  getSubjectDistributionByCollege,
  getAttendanceByCollegeAndSession,
  getModeratorAttendanceBySession
} = require('../controllers/slotController');

// Middlewares
const adminModeratorMiddleware = authorizeRoles('admin', 'moderator');
const studentMiddleware = authorizeRoles('student');
const getScheduleMiddleware = authorizeRoles('admin', 'moderator', 'trainer','student');
const editTopicFeedbackMiddleware = authorizeRoles('admin', 'moderator', 'trainer');
const trainerMiddleware = authorizeRoles('trainer');
const moderatorMiddleware = authorizeRoles('moderator');

// // Standard Scheduling / Slot Routes
// router.get('/upcoming', verifyToken, adminModeratorMiddleware, getUpcomingSlotsByCollege);
// router.post('/', verifyToken, adminModeratorMiddleware, createSlot);
// router.post('/append-slots-csv', verifyToken, adminModeratorMiddleware, appendSlotsViaCSV);
// router.get('/', verifyToken, getScheduleMiddleware, getAllSlots);
// router.get('/:id', verifyToken, adminModeratorMiddleware, getSlotById);
// router.put('/:id', verifyToken, adminModeratorMiddleware, updateSlot);
// router.put('/:id/topic-feedback', verifyToken, editTopicFeedbackMiddleware, updateTopicAndFeedback);
// router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteSlot);

// // Attendance Routes nested or mapped on Slot resource
// router.put('/:id/attendance', verifyToken, trainerMiddleware, submitAttendance);
// router.patch('/:id/attendance', verifyToken, trainerMiddleware, submitAttendance);
// router.get('/:id/attendance', verifyToken, adminModeratorMiddleware, getAttendanceById);

// // Trainer Classes Route
// router.get('/upcoming-classes', verifyToken, trainerMiddleware, getUpcomingClasses);

// // Analytics Route
// router.get('/analytics', verifyToken, moderatorMiddleware, getAnalytics);

// // College-specific / session-specific Data Routes
// router.get('/chart', verifyToken, adminModeratorMiddleware, getAttendanceChartByCollege);
// router.get('/distribution', verifyToken, adminModeratorMiddleware, getSubjectDistributionByCollege);
// router.get('/college/:collegeId/session/:sessionId', verifyToken, adminModeratorMiddleware, getAttendanceByCollegeAndSession);

// Standard Scheduling / Slot Routes
router.get('/student-upcoming-classes', verifyToken, studentMiddleware, getUpcomingStudentClasses);
router.get('/upcoming', verifyToken, adminModeratorMiddleware, getUpcomingSlotsByCollege);
router.get('/upcoming-classes', verifyToken, trainerMiddleware, getUpcomingClasses);
// router.get('/student-upcoming-classes', verifyToken, getScheduleMiddleware, getUpcomingStudentClasses);
router.get('/analytics', verifyToken, moderatorMiddleware, getAnalytics);
router.get('/chart', verifyToken, adminModeratorMiddleware, getAttendanceChartByCollege);
router.get('/distribution', verifyToken, adminModeratorMiddleware, getSubjectDistributionByCollege);
router.get('/college/:collegeId/session/:sessionId', verifyToken, adminModeratorMiddleware, getAttendanceByCollegeAndSession);

router.get("/session/:sessionId/attendance",verifyToken ,adminModeratorMiddleware,getModeratorAttendanceBySession);
router.post('/', verifyToken, adminModeratorMiddleware, createSlot);
router.post('/append-slots-csv', verifyToken, adminModeratorMiddleware, appendSlotsViaCSV);
router.get('/', verifyToken,adminModeratorMiddleware, getAllSlots);


// Dynamic routes LAST
router.get('/:id', verifyToken, adminModeratorMiddleware, getSlotById);
router.put('/:id', verifyToken, adminModeratorMiddleware, updateSlot);
router.put('/:id/topic-feedback', verifyToken, editTopicFeedbackMiddleware, updateTopicAndFeedback);
router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteSlot);
router.put('/:id/attendance', verifyToken, trainerMiddleware, submitAttendance);
router.patch('/:id/attendance', verifyToken, trainerMiddleware, submitAttendance);
router.get('/:id/attendance', verifyToken, adminModeratorMiddleware, getAttendanceById);


module.exports = router;


// ----OLD FILE----
// const express = require('express');
// const router = express.Router();
// const { verifyToken } = require('../middleware/auth');
// const { authorizeRoles } = require('../middleware/authorize');
// const {
//   createSlot,
//   getAllSlots,
//   getSlotById,
//   updateSlot,
//   deleteSlot,
//   getUpcomingSlotsByCollege,
//   appendSlotsViaCSV,
//   updateTopicAndFeedback,
//   getUpcomingClasses,
//   submitAttendance,
//   getAttendanceById,
//   getAnalytics,
//   getAttendanceChartByCollege,
//   getSubjectDistributionByCollege,
//   getAttendanceByCollegeAndSession
// } = require('../controllers/slotController');
//
// // Middlewares
// const adminModeratorMiddleware = authorizeRoles('admin', 'moderator');
// const getScheduleMiddleware = authorizeRoles('admin', 'moderator', 'trainer');
// const editTopicFeedbackMiddleware = authorizeRoles('admin', 'moderator', 'trainer');
// const trainerMiddleware = authorizeRoles('trainer');
// const moderatorMiddleware = authorizeRoles('moderator');
//
// // Standard Scheduling / Slot Routes
// router.get('/upcoming', verifyToken, adminModeratorMiddleware, getUpcomingSlotsByCollege);
// router.post('/', verifyToken, adminModeratorMiddleware, createSlot);
// router.post('/append-slots-csv', verifyToken, adminModeratorMiddleware, appendSlotsViaCSV);
// router.get('/', verifyToken, getScheduleMiddleware, getAllSlots);
// router.get('/:id', verifyToken, adminModeratorMiddleware, getSlotById);
// router.put('/:id', verifyToken, adminModeratorMiddleware, updateSlot);
// router.put('/:id/topic-feedback', verifyToken, editTopicFeedbackMiddleware, updateTopicAndFeedback);
// router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteSlot);
//
// // Attendance Routes nested or mapped on Slot resource
// router.put('/:id/attendance', verifyToken, trainerMiddleware, submitAttendance);
// router.patch('/:id/attendance', verifyToken, trainerMiddleware, submitAttendance);
// router.get('/:id/attendance', verifyToken, adminModeratorMiddleware, getAttendanceById);
//
// // Trainer Classes Route
// router.get('/upcoming-classes', verifyToken, trainerMiddleware, getUpcomingClasses);
//
// // Analytics Route
// router.get('/analytics', verifyToken, moderatorMiddleware, getAnalytics);
//
// // College-specific / session-specific Data Routes
// router.get('/chart', verifyToken, adminModeratorMiddleware, getAttendanceChartByCollege);
// router.get('/distribution', verifyToken, adminModeratorMiddleware, getSubjectDistributionByCollege);
// router.get('/college/:collegeId/session/:sessionId', verifyToken, adminModeratorMiddleware, getAttendanceByCollegeAndSession);
//
// module.exports = router;
