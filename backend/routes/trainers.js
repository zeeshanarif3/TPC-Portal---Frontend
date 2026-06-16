const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
  getTrainersByCollege
} = require('../controllers/trainerController');

// Admin middleware
const adminMiddleware = authorizeRoles('admin');

// Admin Routes for Trainers
router.post('/', verifyToken, adminMiddleware, createTrainer);
router.get('/', verifyToken, adminMiddleware, (req, res) => {
  // If collegeId is provided, get trainers by college; else get all trainers
  if (req.query.collegeId) {
    return getTrainersByCollege(req, res);
  } else {
    return getAllTrainers(req, res);
  }
});
router.get('/:id', verifyToken, adminMiddleware, getTrainerById);
router.put('/:id', verifyToken, adminMiddleware, updateTrainer);
router.delete('/:id', verifyToken, adminMiddleware, deleteTrainer);

module.exports = router;
