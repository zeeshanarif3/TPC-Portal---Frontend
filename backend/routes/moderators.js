const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createModerator,
  getAllModerators,
  getModeratorById,
  updateModerator,
  deleteModerator
} = require('../controllers/moderatorController');

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// Admin Routes for Moderators
router.post('/', verifyToken, adminMiddleware, createModerator);
router.get('/', verifyToken, adminMiddleware, getAllModerators);
router.get('/:id', verifyToken, adminMiddleware, getModeratorById);
router.put('/:id', verifyToken, adminMiddleware, updateModerator);
router.delete('/:id', verifyToken, adminMiddleware, deleteModerator);

module.exports = router;
