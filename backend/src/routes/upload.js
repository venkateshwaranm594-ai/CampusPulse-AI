import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');

['students', 'advisers', 'college'].forEach(folder => {
  const dir = path.join(baseUploadDir, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || req.query.type || 'general';
    let targetFolder = baseUploadDir;
    if (['students', 'advisers', 'college'].includes(type)) {
      targetFolder = path.join(baseUploadDir, type);
    }
    cb(null, targetFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP, SVG) are allowed!'));
  }
});

const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const type = req.body.type || req.query.type || 'general';
    const subFolder = ['students', 'advisers', 'college'].includes(type) ? `${type}/` : '';
    const fileUrl = `/uploads/${subFolder}${req.file.filename}`;

    res.json({
      message: 'Image uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
