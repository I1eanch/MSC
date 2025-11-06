const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const upload = require('../config/multer');
const { body } = require('express-validator');

router.post('/upload',
  authenticateToken,
  authorizeRole('trainer', 'admin'),
  upload.single('video'),
  [
    body('title').trim().notEmpty().escape(),
    body('description').optional().trim().escape()
  ],
  videoController.uploadVideo
);

router.get('/', authenticateToken, videoController.listVideos);

router.get('/:id', authenticateToken, videoController.getVideo);

router.get('/:id/signed-url', authenticateToken, videoController.getSignedUrl);

router.get('/:id/status', authenticateToken, videoController.getTranscodingStatus);

router.delete('/:id', authenticateToken, authorizeRole('trainer', 'admin'), videoController.deleteVideo);

module.exports = router;
