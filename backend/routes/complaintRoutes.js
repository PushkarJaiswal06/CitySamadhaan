import express from 'express';
import multer from 'multer';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus,
  assignComplaint,
  getComplaintStats,
  uploadComplaintImage,
  addComplaintFeedback,
  verifyComplaintBlockchain
} from '../controllers/complaintController.js';
import { authenticate, authorize, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Statistics (for dashboards)
router.get('/stats', getComplaintStats);

// Image upload
router.post('/upload-image', upload.single('image'), uploadComplaintImage);

// CRUD operations
router.post('/', checkPermission('complaints', 'create'), createComplaint);
router.get('/', checkPermission('complaints', 'read'), getComplaints);
router.get('/:id', checkPermission('complaints', 'read'), getComplaint);

// Update operations
router.patch('/:id/status', checkPermission('complaints', 'update'), updateComplaintStatus);
router.patch('/:id/assign', checkPermission('complaints', 'assign'), assignComplaint);
router.post('/:id/feedback', addComplaintFeedback);

// Blockchain verification
router.get('/:id/verify-blockchain', checkPermission('complaints', 'read'), verifyComplaintBlockchain);

export default router;
