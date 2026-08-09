const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const feedbackController = require('../controllers/feedbackController');

// Student route for viewing own feedback (must be BEFORE ID-based routes)
router.get('/me',
  verifyToken,
  roleGuard('student'),
  feedbackController.getMyFeedback
);

// Trainer/Admin operations
router.post('/',
  verifyToken,
  roleGuard('trainer', 'admin'),
  feedbackController.createFeedback
);

router.get('/',
  verifyToken,
  roleGuard('trainer', 'admin','moderator'),
  feedbackController.getFeedback
);

router.put('/:id',
  verifyToken,
  roleGuard('trainer', 'admin'),
  feedbackController.updateFeedback
);

router.delete('/:id',
  verifyToken,
  roleGuard('trainer', 'admin'),
  feedbackController.deleteFeedback
);

module.exports = router;
