const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer
} = require('../controllers/trainerController');

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// Admin Routes for Trainers
router.post('/', verifyToken, adminMiddleware, createTrainer);
router.get('/', verifyToken, adminMiddleware, getAllTrainers);
router.get('/:id', verifyToken, adminMiddleware, getTrainerById);
router.put('/:id', verifyToken, adminMiddleware, updateTrainer);
router.delete('/:id', verifyToken, adminMiddleware, deleteTrainer);

module.exports = router;
