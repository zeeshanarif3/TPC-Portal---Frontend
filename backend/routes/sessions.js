const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');

// Middleware for admin and moderator
const adminModeratorMiddleware = authorizeRoles('admin', 'moderator');

// Admin Routes for Sessions
router.post('/', verifyToken, adminModeratorMiddleware, createSession);
router.get('/', verifyToken, adminModeratorMiddleware, getAllSessions);
router.get('/:id', verifyToken, adminModeratorMiddleware, getSessionById);
router.put('/:id', verifyToken, adminModeratorMiddleware, updateSession);
router.delete('/:id', verifyToken, adminModeratorMiddleware, deleteSession);

module.exports = router;
