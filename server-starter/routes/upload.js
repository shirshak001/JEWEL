// server/routes/upload.js
// Upload routes using AWS S3 with pre-signed URLs

const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { requireAdmin } = require('../middlewares/auth');

// Configure AWS S3 (only if credentials are provided)
let s3 = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
}

// GET /api/admin/upload-url - Get pre-signed URL for upload
router.get('/upload-url', requireAdmin, async (req, res) => {
  try {
    // Check if S3 is configured
    if (!s3) {
      return res.status(501).json({ 
        success: false,
        error: 'S3 upload not configured. Please set AWS credentials in .env file.' 
      });
    }

    const { fileName, fileType } = req.query;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type. Only images allowed.' });
    }

    // Generate unique file name
    const ext = fileName.split('.').pop();
    const uniqueFileName = `products/${uuidv4()}.${ext}`;

    // S3 upload parameters
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: uniqueFileName,
      Expires: 300, // URL expires in 5 minutes
      ContentType: fileType,
      ACL: 'public-read'
    };

    // Generate pre-signed URL
    const uploadUrl = s3.getSignedUrl('putObject', s3Params);
    
    // Public URL where file will be accessible
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    res.json({
      uploadUrl,
      fileUrl,
      fileName: uniqueFileName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/upload - Direct upload (alternative method)
// This is less efficient than pre-signed URLs but simpler
const multer = require('multer');

// Configure storage based on S3 availability
let upload;

if (s3) {
  const multerS3 = require('multer-s3');
  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET_NAME,
      acl: 'public-read',
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `products/${uuidv4()}.${ext}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images allowed.'));
      }
    }
  });
} else {
  // Fallback to memory storage if S3 is not configured
  upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images allowed.'));
      }
    }
  });
}

router.post('/upload', requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // If using S3, return the S3 URL
    if (req.file.location) {
      return res.json({
        success: true,
        url: req.file.location,
        key: req.file.key,
        size: req.file.size
      });
    }

    // If using memory storage (S3 not configured), return placeholder
    res.json({
      success: false,
      error: 'S3 not configured. File received but not stored. Please configure AWS S3 credentials.'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// DELETE /api/admin/upload/:key - Delete uploaded image
router.delete('/upload/:key', requireAdmin, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
