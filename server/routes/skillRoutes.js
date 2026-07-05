import express from 'express';
import { createSkill, deleteSkill, getSkills, updateSkill } from '../controllers/skillController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSkills);
router.post('/', protectAdmin, createSkill);
router.put('/:id', protectAdmin, updateSkill);
router.delete('/:id', protectAdmin, deleteSkill);

export default router;
