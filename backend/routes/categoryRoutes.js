import express from 'express';
import ComplaintCategory from '../models/ComplaintCategory.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth needed for reading categories)
// @desc    Get all categories
// @route   GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { department } = req.query;
    
    let query = {};
    if (department) {
      query.department = department;
    }

    const categories = await ComplaintCategory.find(query)
      .populate('department', 'name code')
      .sort('name');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await ComplaintCategory.findById(req.params.id)
      .populate('department', 'name code');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
});

// Protected routes (require authentication)
router.use(authenticate);

// @desc    Create new category
// @route   POST /api/categories
router.post('/', async (req, res) => {
  try {
    const category = await ComplaintCategory.create(req.body);
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category'
    });
  }
});

export default router;
