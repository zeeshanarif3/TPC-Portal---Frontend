const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const performanceController = require('../controllers/performanceController');

// Student access for their own performance summary (must be BEFORE studentId param)
router.get('/me',
  verifyToken,
  roleGuard('student'),
  performanceController.getMyPerformance
);

// Trainer/Admin access for specific student's summary
router.get('/:studentId',
  verifyToken,
  roleGuard('trainer', 'admin','moderator'),
  performanceController.getStudentPerformance
);

module.exports = router;
