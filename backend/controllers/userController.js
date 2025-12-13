import User from '../models/User.js';
import Role from '../models/Role.js';
import Department from '../models/Department.js';
import { setCache, getCache, deleteCache } from '../config/redis.js';

// @desc    Get all users (Admin only)
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 20, isActive } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .populate('role', 'name')
      .populate('department', 'name')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role', 'name permissions')
      .populate('department', 'name code')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, department, address, language } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ phone }, { email: email || undefined }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone or email already exists'
      });
    }

    // Verify role and department exist
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    let departmentDoc = null;
    if (department) {
      departmentDoc = await Department.findById(department);
      if (!departmentDoc) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      department: department || undefined,
      address,
      language: language || 'en',
      authMethod: password ? 'password' : 'otp',
      isVerified: { phone: true, email: false }
    });

    // Don't return password
    const userData = await User.findById(user._id)
      .populate('role', 'name')
      .populate('department', 'name')
      .select('-password -refreshToken');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userData
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user'
    });
  }
};

// @desc    Update user
// @route   PATCH /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, address, isActive, language } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email !== undefined) user.email = email;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (address) user.address = { ...user.address, ...address };
    if (isActive !== undefined) user.isActive = isActive;
    if (language) user.language = language;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('role', 'name')
      .populate('department', 'name')
      .select('-password -refreshToken');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// @desc    Get field workers for assignment
// @route   GET /api/users/field-workers
export const getFieldWorkers = async (req, res) => {
  try {
    const { department } = req.query;

    // Find field worker role
    const fieldWorkerRole = await Role.findOne({ name: 'field_worker' });
    if (!fieldWorkerRole) {
      return res.status(404).json({
        success: false,
        message: 'Field worker role not found'
      });
    }

    const query = {
      role: fieldWorkerRole._id,
      isActive: true
    };

    if (department) {
      query.department = department;
    }

    const fieldWorkers = await User.find(query)
      .select('name phone department')
      .populate('department', 'name');

    res.json({
      success: true,
      data: fieldWorkers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch field workers'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
export const getUserStats = async (req, res) => {
  try {
    const [totalUsers, activeUsers, roleDistribution] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'roleInfo'
          }
        },
        { $unwind: '$roleInfo' },
        {
          $group: {
            _id: '$roleInfo.name',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleDistribution: roleDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getFieldWorkers,
  getUserStats
};
