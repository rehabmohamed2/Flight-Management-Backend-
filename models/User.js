const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  passportNumber: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordOTP: {
    type: String,
    select: false
  },
  resetPasswordOTPExpire: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordTokenExpire: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  // Skip if password is not modified or doesn't exist (Google OAuth users)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP for password reset
userSchema.methods.generateResetOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.resetPasswordOTP = otp;
  this.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return otp;
};

// Generate reset token for password reset
userSchema.methods.generateResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
