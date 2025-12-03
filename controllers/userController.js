const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, role, dateOfBirth, passportNumber, isActive } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: role || 'user',
      dateOfBirth,
      passportNumber,
      isActive: isActive !== undefined ? isActive : true
    });

    // Fetch the user again to get all fields properly
    const user = await User.findById(newUser._id);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, phoneNumber, role, password, dateOfBirth, passportNumber, isActive } = req.body;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists. Please use a different email.'
        });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (role) user.role = role;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (passportNumber !== undefined) user.passportNumber = passportNumber;
    if (isActive !== undefined) user.isActive = isActive;

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
