const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// Admin Routes for Students
router.post('/', verifyToken, adminMiddleware, createStudent);
router.get('/', verifyToken, adminMiddleware, getAllStudents);
router.get('/:id', verifyToken, adminMiddleware, getStudentById);
router.put('/:id', verifyToken, adminMiddleware, updateStudent);
router.delete('/:id', verifyToken, adminMiddleware, deleteStudent);

module.exports = router;
