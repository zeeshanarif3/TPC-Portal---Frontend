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

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// Admin Routes for Courses
router.post('/', verifyToken, adminMiddleware, createCourse);
router.get('/', verifyToken, adminMiddleware, getAllCourses);
router.get('/:id', verifyToken, adminMiddleware, getCourseById);
router.put('/:id', verifyToken, adminMiddleware, updateCourse);
router.delete('/:id', verifyToken, adminMiddleware, deleteCourse);

module.exports = router;
