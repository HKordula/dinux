const User = require('../models/User');
const Dinosaur = require('../models/Dinosaur');
const asyncHandler = require('../utils/asyncHandler');
const { idParamCheck } = require('../middleware/validate');

const manageUsers = asyncHandler(async (req, res) => {
  const [users] = await pool.query(
    `SELECT id, username, email, role, created_at 
     FROM users 
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC`
  );
  
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid role specified'
    });
  }

  const [result] = await pool.query(
    `UPDATE users 
     SET role = ? 
     WHERE id = ? AND deleted_at IS NULL`,
    [role, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User role updated successfully'
  });
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tempPassword = generateTempPassword();
  
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  const [result] = await pool.query(
    `UPDATE users 
     SET password = ? 
     WHERE id = ?`,
    [hashedPassword, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'Password reset initiated'
  });
});

const manageDinosaur = asyncHandler(async (req, res) => {
    // TODO
});

module.exports = {
  manageUsers,
  updateUserStatus,
  resetUserPassword,
  manageDinosaur
};