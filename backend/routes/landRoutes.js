import express from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  registerProperty,
  getProperties,
  getPropertyById,
  verifyProperty,
  uploadPropertyDocument,
  verifyPropertyByOfficial,
  initiateTransfer,
  getTransfers,
  getTransferById,
  approveTransferStage,
  updateTransferStage,
  uploadTransferDocument,
  cancelTransfer,
  getTransferStats
} from '../controllers/landController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
    }
  }
});

// ==================== PUBLIC ROUTES ====================

// Public property verification (no auth required)
router.get('/properties/verify', verifyProperty);

// ==================== PROTECTED ROUTES ====================

// Property routes
router.post('/properties', authenticate, registerProperty);
router.get('/properties', authenticate, getProperties);
router.get('/properties/:id', authenticate, getPropertyById);
router.post('/properties/:id/documents', authenticate, upload.single('document'), uploadPropertyDocument);

// Property verification by officials
router.put(
  '/properties/:id/verify',
  authenticate,
  authorize('surveyor', 'sub_registrar', 'tehsildar', 'land_registry', 'admin', 'super_admin'),
  verifyPropertyByOfficial
);

// Transfer routes
router.post('/transfers', authenticate, initiateTransfer);
router.get('/transfers', authenticate, getTransfers);
router.get('/transfers/stats', authenticate, getTransferStats);
router.get('/transfers/:id', authenticate, getTransferById);
router.put('/transfers/:id/stage', authenticate, updateTransferStage);
router.post('/transfers/:id/documents', authenticate, upload.single('document'), uploadTransferDocument);
router.post('/transfers/:id/cancel', authenticate, cancelTransfer);

// Transfer approval by officials
router.put(
  '/transfers/:id/approve',
  authenticate,
  authorize('surveyor', 'sub_registrar', 'tehsildar', 'land_registry', 'admin', 'super_admin'),
  approveTransferStage
);

export default router;
