import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getFieldWorkers,
  getUserStats
} from '../controllers/userController.js';
import { authenticate, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/stats', checkPermission('users', 'read'), getUserStats);

// Field workers (for assignment dropdown)
router.get('/field-workers', checkPermission('complaints', 'assign'), getFieldWorkers);

// CRUD operations
router.get('/', checkPermission('users', 'read'), getUsers);
router.post('/', checkPermission('users', 'create'), createUser);
router.get('/:id', checkPermission('users', 'read'), getUser);
router.patch('/:id', checkPermission('users', 'update'), updateUser);
router.delete('/:id', checkPermission('users', 'delete'), deleteUser);

export default router;
