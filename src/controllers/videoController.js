const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { run, get, query } = require('../database/db');
const logger = require('../utils/logger');
const videoService = require('../services/videoService');
const transcodingService = require('../services/transcodingService');
const signedUrlService = require('../services/signedUrlService');

const uploadVideo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { title, description } = req.body;
    const videoId = uuidv4();

    await run(
      `INSERT INTO videos (
        id, user_id, title, description, original_filename, 
        s3_key, s3_bucket, file_size, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        videoId,
        req.user.id,
        title,
        description || null,
        req.file.originalname,
        req.file.key,
        req.file.bucket,
        req.file.size,
        'uploaded'
      ]
    );

    logger.info(`Video uploaded: ${videoId} by user ${req.user.id}`);

    const jobId = await transcodingService.startTranscoding(videoId, req.file.key);

    await run(
      'UPDATE videos SET mediaconvert_job_id = ?, status = ? WHERE id = ?',
      [jobId, 'transcoding', videoId]
    );

    res.status(201).json({
      message: 'Video uploaded successfully',
      videoId,
      status: 'transcoding',
      jobId
    });
  } catch (error) {
    logger.error('Upload error:', error);
    next(error);
  }
};

const listVideos = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let sql = 'SELECT id, title, description, status, duration, created_at FROM videos WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const videos = await query(sql, params);

    res.json({
      videos,
      count: videos.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

const getVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const video = await get('SELECT * FROM videos WHERE id = ?', [id]);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const outputs = await query('SELECT * FROM video_outputs WHERE video_id = ?', [id]);

    res.json({
      video,
      outputs
    });
  } catch (error) {
    next(error);
  }
};

const getSignedUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'hls', resolution = '1080p' } = req.query;

    const video = await get('SELECT * FROM videos WHERE id = ?', [id]);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (video.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Video not ready',
        status: video.status
      });
    }

    const output = await get(
      'SELECT * FROM video_outputs WHERE video_id = ? AND format = ? AND resolution = ?',
      [id, format, resolution]
    );

    if (!output) {
      return res.status(404).json({ 
        error: 'Video output not found',
        message: `Format ${format} with resolution ${resolution} not available`
      });
    }

    const signedUrl = await signedUrlService.generateSignedUrl(
      output.cloudfront_url,
      parseInt(process.env.SIGNED_URL_EXPIRY || 3600)
    );

    const drmToken = signedUrlService.generateDRMToken(id, req.user.id);

    res.json({
      signedUrl,
      drmToken,
      expiresIn: parseInt(process.env.SIGNED_URL_EXPIRY || 3600),
      format,
      resolution
    });
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    next(error);
  }
};

const getTranscodingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const video = await get('SELECT * FROM videos WHERE id = ?', [id]);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (video.mediaconvert_job_id) {
      const jobStatus = await transcodingService.getJobStatus(video.mediaconvert_job_id);
      
      if (jobStatus.status !== video.status) {
        await run('UPDATE videos SET status = ? WHERE id = ?', [jobStatus.status, id]);
      }

      return res.json({
        videoId: id,
        status: jobStatus.status,
        progress: jobStatus.progress,
        jobId: video.mediaconvert_job_id
      });
    }

    res.json({
      videoId: id,
      status: video.status
    });
  } catch (error) {
    next(error);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const video = await get('SELECT * FROM videos WHERE id = ?', [id]);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await videoService.deleteVideoFromS3(video.s3_bucket, video.s3_key);

    const outputs = await query('SELECT * FROM video_outputs WHERE video_id = ?', [id]);
    
    for (const output of outputs) {
      await videoService.deleteVideoFromS3(output.s3_bucket, output.s3_key);
    }

    await run('DELETE FROM video_outputs WHERE video_id = ?', [id]);
    await run('DELETE FROM videos WHERE id = ?', [id]);

    logger.info(`Video deleted: ${id}`);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadVideo,
  listVideos,
  getVideo,
  getSignedUrl,
  getTranscodingStatus,
  deleteVideo
};
