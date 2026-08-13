import express from 'express';
import {
  createExperience,
  deleteExperience,
  getExperiences,
  updateExperience,
} from '../controllers/experienceController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getExperiences);
router.post('/', protectAdmin, createExperience);
router.put('/:id', protectAdmin, updateExperience);
router.delete('/:id', protectAdmin, deleteExperience);

export default router;
