const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege
} = require('../controllers/collegeController');

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// Admin Routes for Colleges
router.post('/', verifyToken, adminMiddleware, createCollege);
router.get('/', verifyToken, adminMiddleware, getAllColleges);
router.get('/:id', verifyToken, adminMiddleware, getCollegeById);
router.put('/:id', verifyToken, adminMiddleware, updateCollege);
router.delete('/:id', verifyToken, adminMiddleware, deleteCollege);

module.exports = router;
