const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const assessmentController = require('../controllers/assessmentController');

// Standard assessment CRUD
router.post('/',
  verifyToken,
  roleGuard('trainer', 'admin'),
  assessmentController.createAssessment
);

router.get('/',
  verifyToken,
  roleGuard('trainer', 'admin', 'student','moderator'),
  assessmentController.getAllAssessments
);

router.get('/:id',
  verifyToken,
  roleGuard('trainer', 'admin', 'student','moderator'),
  assessmentController.getAssessmentById
);

router.put('/:id',
  verifyToken,
  roleGuard('trainer', 'admin'),
  assessmentController.updateAssessment
);

router.delete('/:id',
  verifyToken,
  roleGuard('trainer', 'admin'),
  assessmentController.deleteAssessment
);

// Assessment submissions
router.post('/:id/submit',
  verifyToken,
  roleGuard('student'),
  assessmentController.submitAssessment
);

router.get('/:id/submissions/me',
  verifyToken,
  roleGuard('student'),
  assessmentController.getOwnSubmission
);

router.get('/:id/submissions',
  verifyToken,
  roleGuard('trainer', 'admin','moderator'),
  assessmentController.getAssessmentSubmissions
);

module.exports = router;
