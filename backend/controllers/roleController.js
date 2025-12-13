import Role from '../models/Role.js';

// @desc    Get all roles
// @route   GET /api/roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ level: 1 });

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles'
    });
  }
};

// @desc    Get single role
// @route   GET /api/roles/:id
export const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role'
    });
  }
};
