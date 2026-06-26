const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.gif']);
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE || 2 * 1024 * 1024),
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const extname = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extname)) {
      return cb(null, true);
    }

    return cb(new Error('Images only'));
  },
});

module.exports = upload;
