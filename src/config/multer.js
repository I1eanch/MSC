const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { s3 } = require('./aws');

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user ? req.user.id.toString() : 'unknown'
      });
    },
    key: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `uploads/${uuidv4()}${fileExt}`;
      cb(null, fileName);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024
  }
});

module.exports = upload;
