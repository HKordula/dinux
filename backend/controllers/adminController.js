import User from '../models/User.js';
import Dinosaur from '../models/Dinosaur.js';
import asyncHandler from '../utils/asyncHandler.js';
import bcrypt from 'bcrypt';

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

const deleteUser = async (req, res, next) => {
  try {
    const affectedRows = await User.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const affectedRows = await User.updateRole(userId, role);
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User role updated' });
  } catch (err) {
    next(err);
  }
};

// helper for temp password
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
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({
    success: true,
    message: 'Password reset initiated',
    tempPassword // temp password for admin to give to user
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
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  manageDinosaur
};