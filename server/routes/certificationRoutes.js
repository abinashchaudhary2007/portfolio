import express from 'express';
import multer from 'multer';
import {
  createCertification,
  deleteCertification,
  getCertifications,
  updateCertification,
} from '../controllers/certificationController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getCertifications);
router.post('/', protectAdmin, upload.array('file', 10), createCertification);
router.put('/:id', protectAdmin, upload.array('file', 10), updateCertification);
router.delete('/:id', protectAdmin, deleteCertification);

export default router;
