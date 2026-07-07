import express from 'express';
import multer from 'multer';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Use memory storage — files are uploaded to Supabase Storage, not local disk
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getSettings);
router.put('/', protectAdmin, upload.single('profilePhoto'), updateSettings);

export default router;
