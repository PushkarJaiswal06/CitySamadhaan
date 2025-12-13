import Department from '../models/Department.js';
import ComplaintCategory from '../models/ComplaintCategory.js';

// @desc    Get all departments
// @route   GET /api/departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('headOfficer', 'name email phone')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments'
    });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfficer', 'name email phone');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get categories for this department
    const categories = await ComplaintCategory.find({ 
      department: department._id,
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        ...department.toObject(),
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department'
    });
  }
};

// @desc    Get complaint categories
// @route   GET /api/departments/:id/categories
export const getDepartmentCategories = async (req, res) => {
  try {
    const categories = await ComplaintCategory.find({ 
      department: req.params.id,
      isActive: true 
    }).populate('department', 'name code');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// @desc    Get all categories (across departments)
// @route   GET /api/categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await ComplaintCategory.find({ isActive: true })
      .populate('department', 'name code');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};
