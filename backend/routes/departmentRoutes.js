import express from 'express';
import {
  getDepartments,
  getDepartment,
  getDepartmentCategories,
  getAllCategories
} from '../controllers/departmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for registration dropdown)
router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.get('/:id/categories', getDepartmentCategories);

// Categories
router.get('/categories/all', getAllCategories);

export default router;
