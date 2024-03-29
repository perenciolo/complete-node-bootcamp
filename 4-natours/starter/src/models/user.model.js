const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const AppError = require('../services/appError');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name.'],
    trim: true,
    maxlength: [100, 'A user name must have 40 characters or less.'],
    minlength: [3, 'A user name must have at least 10 characters.']
  },
  email: {
    type: String,
    required: [true, 'A user must have a name.'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.']
  },
  photo: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Please provide a password'],
    minlength: 8,
    validate: {
      validator: function(value) {
        return validator.matches(
          value,
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
        );
      },
      message:
        'A password must have at least 8 characters, 1 lowercase character, 1 uppercase character, 1 number and 1 special character'
    },
    select: false
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      //  This only works on SAVE.
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password and confirmation do not match.'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true, select: false }
});

/**
 * Document Middleware:
 * runs before {.save()} and {.create()}.
 */
userSchema.pre('save', async function(next) {
  // If not modified password go to next.
  if (!this.isModified('password')) return next();

  if (this.password !== this.passwordConfirm)
    return next(new AppError('Password and confirmation do not match.', 400));

  // Encrypt the password and unset the corfirm.
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Ensure that token is created after password changed by subtracting 1s.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });

  next();
});

// Instance Method.
userSchema.methods.correctPwd = async function(candidatePwd, userPwd) {
  // Compare if passwords match.
  return await bcrypt.compare(candidatePwd, userPwd);
};

userSchema.methods.changedPwdAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    // Change to miliseconds then to seconds and parse int.
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return changedTimestamp < jwtTimestamp;
  }

  return false; // Not changed
};

userSchema.methods.createPwdResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Save securely on DB.
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Save for use in 10 minutes.
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
