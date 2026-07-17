const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByCourse
} = require('../controllers/studentController');

// Middleware for admin and moderator
const adminModeratorMiddleware = authorizeRoles('admin', 'moderator');
const getStudentsMiddleware = authorizeRoles('admin', 'moderator', 'trainer');

// Admin Routes for Students
router.post('/', verifyToken, adminModeratorMiddleware, createStudent);
router.get('/', verifyToken, getStudentsMiddleware, getAllStudents);
router.get('/course/:courseId', verifyToken, getStudentsMiddleware, getStudentByCourse);
router.get('/:id', verifyToken, adminModeratorMiddleware, getStudentById);
router.put('/:id', verifyToken, adminModeratorMiddleware, updateStudent);
router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteStudent);

module.exports = router;
