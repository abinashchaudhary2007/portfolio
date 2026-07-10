import express from 'express';
import { chat, getSettings, updateSettings, getFAQs, createFAQ, deleteFAQ } from '../controllers/aiController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public chat interaction
router.post('/chat', chat);

// AI assistant settings
router.get('/settings', getSettings);
router.put('/settings', protectAdmin, updateSettings);

// Custom FAQs
router.get('/faqs', getFAQs);
router.post('/faqs', protectAdmin, createFAQ);
router.delete('/faqs/:id', protectAdmin, deleteFAQ);

export default router;
