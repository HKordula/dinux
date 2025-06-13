import User from '../models/User.js';
import Dinosaur from '../models/Dinosaur.js';
import asyncHandler from '../utils/asyncHandler.js';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import constants from '../config/constants.js';

const manageUsers = asyncHandler(async (req, res) => {
  let users = [];
  if (User.getAll) {
    users = await User.getAll();
  } else {
    users = await User.findAll ? await User.findAll() : [];
  }
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role = constants.ROLES.USER, status = constants.USER_STATUS.ACTIVATED } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  const existing = await User.findByUsername(username) || await User.findByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, error: 'User with this username or email already exists' });
  }
  const id = await User.create({ username, email, password, role, status });

  try {
    if (req.user && req.user.role === constants.ROLES.ADMIN) {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
        [req.user.id, 'CREATE_USER', `Created user id=${id}, username=${username}, email=${email}, role=${role}, status=${status}`]
      );
    }
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }

  res.status(201).json({ success: true, data: { id, username, email, role, status } });
});

const deleteUser = async (req, res, next) => {
  try {
    const affectedRows = await User.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
    }

    try {
      if (req.user && req.user.role === constants.ROLES.ADMIN) {
        await pool.query(
          'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
          [req.user.id, 'DELETE_USER', `Deleted user id=${req.params.id}`]
        );
      }
    } catch (err) {
      console.error('Failed to log admin action:', err);
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role, status } = req.body;

    const oldUser = await User.findById(userId);

    const affectedRows = await User.updateRoleAndStatus(userId, role, status);
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
    }

    let changes = [];
    if (oldUser) {
      if (role !== undefined && role !== oldUser.role) {
        changes.push(`role: "${oldUser.role}" → "${role}"`);
      }
      if (status !== undefined && status !== oldUser.status) {
        changes.push(`status: "${oldUser.status}" → "${status}"`);
      }
    }
    const details = `Updated user id=${userId}. Changes: ${changes.join(', ')}`;

    try {
      if (req.user && req.user.role === constants.ROLES.ADMIN) {
        await pool.query(
          'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
          [req.user.id, 'UPDATE_USER', details]
        );
      }
    } catch (err) {
      console.error('Failed to log admin action:', err);
    }

    res.json({ success: true, message: 'User role and status updated' });
  } catch (err) {
    next(err);
  }
};

function generateTempPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const affectedRows = await User.update(id, { password: hashedPassword });
  if (affectedRows === 0) {
    return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
  }

  res.json({
    success: true,
    message: 'Password reset initiated',
    tempPassword
  });
});

const manageDinosaur = asyncHandler(async (req, res) => {
  const dinosaurs = await Dinosaur.findAll();
  res.json({
    success: true,
    count: dinosaurs.length,
    data: dinosaurs
  });
});

export {
  manageUsers,
  createUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  manageDinosaur
};