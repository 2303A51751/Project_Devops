const crypto = require('crypto');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role, phone, address });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'register',
      resourceType: 'User',
      resourceId: user._id,
      details: `User ${user.name} registered with role ${user.role}`,
      ipAddress: req.ip,
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'login',
      resourceType: 'User',
      resourceId: user._id,
      details: `User ${user.name} logged in`,
      ipAddress: req.ip,
    });

    const token = user.generateAuthToken();

    res.json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const allowed = ['name', 'phone', 'address', 'avatar'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateAuthToken();

    res.json({ success: true, message: 'Password updated successfully', token });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password (generates token, logs to console)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to user
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: Date.now() + 30 * 60 * 1000, // 30 minutes
    });

    // Log token to console (no email service)
    console.log('===========================================');
    console.log('PASSWORD RESET TOKEN (send to user via email in production)');
    console.log(`User: ${user.email}`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Expires: ${new Date(Date.now() + 30 * 60 * 1000).toISOString()}`);
    console.log('===========================================');

    res.json({
      success: true,
      message: 'Password reset token generated. Check server console.',
      resetToken, // Included for academic testing convenience
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'reset_password',
      resourceType: 'User',
      resourceId: user._id,
      details: `User ${user.email} successfully reset their password`,
      ipAddress: req.ip,
    });

    const authToken = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in.',
      token: authToken,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
