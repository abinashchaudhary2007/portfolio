import express from 'express';
import multer from 'multer';
import path from 'path';
import { createProject, deleteProject, getProjects, updateProject } from '../controllers/projectController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

router.get('/', getProjects);
router.post('/', protectAdmin, upload.single('image'), createProject);
router.put('/:id', protectAdmin, upload.single('image'), updateProject);
router.delete('/:id', protectAdmin, deleteProject);

export default router;
