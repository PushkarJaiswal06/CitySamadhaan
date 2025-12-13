import User from '../models/User.js';
import Role from '../models/Role.js';
import redisClient from '../config/redis.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import msg91Service from '../services/msg91Service.js';
import crypto from 'crypto';

// @desc    Register new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, phone, email, password, authMethod = 'otp', language = 'en' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Get citizen role
    const citizenRole = await Role.findOne({ name: 'citizen' });
    if (!citizenRole) {
      return res.status(500).json({
        success: false,
        message: 'Default citizen role not found. Please contact administrator.'
      });
    }

    // Create user
    const user = await User.create({
      name,
      phone,
      email,
      password: authMethod === 'password' ? password : undefined,
      authMethod,
      role: citizenRole._id,
      language
    });

    // Send OTP if auth method is OTP
    if (authMethod === 'otp') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.setex(`otp:${phone}`, 300, otp); // 5 minutes expiry

      await msg91Service.sendSMS(
        phone,
        `Your CitySamdhaan verification OTP is ${otp}. Valid for 5 minutes.`
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful. OTP sent to your phone.',
        data: {
          userId: user._id,
          phone: user.phone,
          requiresOTP: true
        }
      });
    }

    // Generate tokens for password auth
    const token = generateToken(user._id, citizenRole.name);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: citizenRole.name
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { phone, password, authMethod = 'otp' } = req.body;

    // Find user
    const user = await User.findOne({ phone })
      .select('+password')
      .populate('role')
      .populate('department');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed attempts'
      });
    }

    // Password authentication
    if (authMethod === 'password') {
      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        await user.incLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate tokens
      const token = generateToken(user._id, user.role.name);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role.name,
            department: user.department?.name
          },
          token,
          refreshToken
        }
      });
    }

    // OTP authentication
    if (authMethod === 'otp') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.setex(`otp:${phone}`, 300, otp);

      await msg91Service.sendSMS(
        phone,
        `Your CitySamdhaan login OTP is ${otp}. Valid for 5 minutes.`
      );

      return res.json({
        success: true,
        message: 'OTP sent to your phone',
        data: {
          phone,
          requiresOTP: true
        }
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Get OTP from Redis
    const storedOTP = await redisClient.get(`otp:${phone}`);

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found'
      });
    }

    if (storedOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Delete OTP
    await redisClient.del(`otp:${phone}`);

    // Find user
    const user = await User.findOne({ phone })
      .populate('role')
      .populate('department');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark phone as verified
    user.isVerified.phone = true;
    user.lastLogin = new Date();

    // Generate tokens
    const token = generateToken(user._id, user.role.name);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role.name,
          department: user.department?.name
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId)
      .select('+refreshToken')
      .populate('role');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, user.role.name);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .populate('department');

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        department: user.department,
        language: user.language,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
};
