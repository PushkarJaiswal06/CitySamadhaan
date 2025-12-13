import express from 'express';
import { getRoles, getRole } from '../controllers/roleController.js';

const router = express.Router();

// Public routes (for registration)
router.get('/', getRoles);
router.get('/:id', getRole);

export default router;
