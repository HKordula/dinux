const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const constants = require('../config/constants');

const register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    const error = new Error('Username already exists');
    error.statusCode = 409;
    throw error;
  }

  const userId = await User.create({ username, email, password });

  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: constants.JWT.EXPIRES_IN }
  );

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: userId,
        username,
        email
      }
    }
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // 1. Check if username and password exist
  if (!username || !password) {
    const error = new Error('Please provide username and password');
    error.statusCode = 400;
    throw error;
  }

  // 2. Check if user exists
  const user = await User.findByUsername(username);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // 3. Check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // 4. Generate token
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: constants.JWT.EXPIRES_IN }
  );

  // 5. Remove sensitive data
  delete user.password;

  res.json({
    success: true,
    data: {
      token,
      user
    }
  });
});

module.exports = {
  register,
  login
};