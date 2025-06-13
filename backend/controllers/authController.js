// filepath: /home/gdziewon/Documents/dinux/backend/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import constants from '../config/constants.js';

const register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'Username already exists' });
  }
  const existingEmail = await User.findByEmail(email);
  if (existingEmail) {
    return res.status(400).json({ success: false, error: 'Email already exists' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
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
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please provide username and password' });
  }
  const user = await User.findByUsername(username);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, error: 'Your account is blocked. Please contact the administrator.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    await User.incrementFailedLogins(user.id);
    const updatedUser = await User.findByUsername(username);
    const attemptsLeft = Math.max(0, 10 - updatedUser.failed_logins);
    if (updatedUser.failed_logins >= 10) {
      await User.blockUser(user.id);
      return res.status(403).json({
        success: false,
        error: 'Your account has been blocked due to too many failed login attempts.',
        attemptsLeft: 0
      });
    }
    return res.status(401).json({
      success: false,
      error: `Invalid credentials. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left before your account is blocked.`,
      attemptsLeft
    });
  }

  await User.resetFailedLogins(user.id);

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: constants.JWT.EXPIRES_IN }
  );
  delete user.password;
  res.json({
    success: true,
    data: {
      token,
      user
    }
  });
});

export {
  register,
  login
};