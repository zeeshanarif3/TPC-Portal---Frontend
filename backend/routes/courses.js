const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

// Middleware for admin and moderator
const adminModeratorMiddleware = authorizeRoles('admin', 'moderator');

// Admin Routes for Courses
router.post('/', verifyToken, adminModeratorMiddleware, createCourse);
router.get('/', verifyToken, adminModeratorMiddleware, getAllCourses);
router.get('/:id', verifyToken, adminModeratorMiddleware, getCourseById);
router.put('/:id', verifyToken, adminModeratorMiddleware, updateCourse);
router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteCourse);

module.exports = router;
