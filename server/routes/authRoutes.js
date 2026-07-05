import express from 'express';
import { loginAdmin, updateAdminCredentials } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.put('/profile', protectAdmin, updateAdminCredentials);

export default router;
