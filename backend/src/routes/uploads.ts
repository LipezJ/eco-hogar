import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();
router.use(requireAuth);

const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

type UploadedFile = Express.Multer.File;

const storage = multer.diskStorage({
  destination: (_req: Request, _file: UploadedFile, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: UploadedFile, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[\s]+/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req: Request, res: Response) => {
  const file = req.file as UploadedFile | undefined;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const relativePath = `/uploads/${file.filename}`;
  const absoluteUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

  return res.status(201).json({
    url: absoluteUrl,
    path: relativePath,
    filename: file.originalname,
  });
});

export default router;
