import express from 'express';
import multer from 'multer';
import { createProject, deleteProject, getProjects, updateProject } from '../controllers/projectController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Use memory storage — files are uploaded to Supabase Storage, not local disk
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getProjects);
router.post('/', protectAdmin, upload.single('image'), createProject);
router.put('/:id', protectAdmin, upload.single('image'), updateProject);
router.delete('/:id', protectAdmin, deleteProject);

export default router;
