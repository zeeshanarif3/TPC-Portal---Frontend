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

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// Admin Routes for Sessions
router.post('/', verifyToken, adminMiddleware, createSession);
router.get('/', verifyToken, adminMiddleware, getAllSessions);
router.get('/:id', verifyToken, adminMiddleware, getSessionById);
router.put('/:id', verifyToken, adminMiddleware, updateSession);
router.delete('/:id', verifyToken, adminMiddleware, deleteSession);

module.exports = router;
