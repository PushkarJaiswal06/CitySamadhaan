import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus,
  assignComplaint,
  getComplaintStats
} from '../controllers/complaintController.js';
import { authenticate, authorize, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Statistics (for dashboards)
router.get('/stats', getComplaintStats);

// CRUD operations
router.post('/', checkPermission('complaints', 'create'), createComplaint);
router.get('/', checkPermission('complaints', 'read'), getComplaints);
router.get('/:id', checkPermission('complaints', 'read'), getComplaint);

// Update operations
router.patch('/:id/status', checkPermission('complaints', 'update'), updateComplaintStatus);
router.patch('/:id/assign', checkPermission('complaints', 'assign'), assignComplaint);

export default router;
