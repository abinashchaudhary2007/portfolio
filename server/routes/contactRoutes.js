import express from 'express';
import { createContact, deleteContact, getContacts, markContactAsRead } from '../controllers/contactController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createContact);
router.get('/', protectAdmin, getContacts);
router.patch('/:id/read', protectAdmin, markContactAsRead);
router.delete('/:id', protectAdmin, deleteContact);

export default router;
