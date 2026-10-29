const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  }
});

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    const error = new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
}

const uploadProductImage = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB max
  },
  fileFilter
}).single('image');

function handleUpload(req, res, next) {
  uploadProductImage(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash('error', 'Image file is too large. Maximum file size allowed is 2 MB.');
      } else {
        req.flash('error', `Upload error: ${err.message}`);
      }
      const redirectUrl = req.header('Referer') || '/admin/products';
      return res.redirect(redirectUrl);
    } else if (err) {
      req.flash('error', err.message);
      const redirectUrl = req.header('Referer') || '/admin/products';
      return res.redirect(redirectUrl);
    }
    next();
  });
}

module.exports = {
  handleUpload
};
