const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
  passwordChangedAt: Date
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

module.exports = mongoose.model('User', userSchema);
