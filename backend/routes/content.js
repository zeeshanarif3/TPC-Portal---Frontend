const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { upload } = require('../services/storage.service');

const contentSkeletonController = require('../controllers/contentSkeletonController');
const contentController = require('../controllers/contentController');

// --- ContentSkeleton Routes (/api/content/skeleton) ---
router.post('/skeleton',
  verifyToken,
  roleGuard('admin'),
  contentSkeletonController.createSkeleton
);

router.get('/skeleton',
  verifyToken,
  roleGuard('admin', 'trainer', 'student','moderator'),
  contentSkeletonController.getAllSkeletons
);

router.get('/skeleton/:id',
  verifyToken,
  roleGuard('admin', 'trainer', 'student','moderator'),
  contentSkeletonController.getSkeletonById
);

router.put('/skeleton/:id',
  verifyToken,
  roleGuard('admin'),
  contentSkeletonController.updateSkeleton
);

router.delete('/skeleton/:id',
  verifyToken,
  roleGuard('admin'),
  contentSkeletonController.deleteSkeleton
);


// --- Content Routes (/api/content) ---

// Program structure endpoint (must be BEFORE /:id to prevent matching issues)
router.get('/program-structure',
  verifyToken,
  roleGuard('admin', 'trainer', 'student','moderator'),
  contentController.getProgramStructure
);

router.post('/',
  verifyToken,
  roleGuard('admin', 'trainer'),
  upload.single('file'),
  contentController.createContent
);

router.get('/',
  verifyToken,
  roleGuard('admin', 'trainer', 'student','moderator'),
  contentController.getAllContent
);

router.get('/:id',
  verifyToken,
  roleGuard('admin', 'trainer', 'student','moderator'),
  contentController.getContentById
);

// router.get('/:id/download',
//   verifyToken,
//   roleGuard('admin', 'trainer', 'student'),
//   contentController.downloadFile
// );
router.get('/:id/download',
  verifyToken,
  roleGuard('admin', 'trainer'),
  contentController.downloadFile
);

router.get('/:id/preview',
  verifyToken,
  roleGuard('admin', 'trainer', 'student','moderator'),
  contentController.previewFile
);

router.put('/:id',
  verifyToken,
  roleGuard('admin', 'trainer'),
  upload.single('file'),
  contentController.updateContent
);

router.delete('/:id',
  verifyToken,
  roleGuard('admin', 'trainer'),
  contentController.deleteContent
);

module.exports = router;
