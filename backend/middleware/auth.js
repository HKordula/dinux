const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const constants = require('../config/constants');

const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new Error(constants.ERROR_MESSAGES.UNAUTHORIZED);
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Get user from database
    const [users] = await pool.query(
      `SELECT id, username, email, role, created_at 
       FROM users 
       WHERE id = ? AND deleted_at IS NULL`,
      [decoded.userId]
    );

    if (!users.length) {
      throw new Error('User belonging to this token no longer exists');
    }

    // 4. Attach user to request
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Invalid token';
    }
    if (error.name === 'TokenExpiredError') {
      error.message = 'Token expired';
    }
    error.statusCode = 401;
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(
        `Role (${req.user.role}) is not allowed to access this resource`
      );
      error.statusCode = 403;
      next(error);
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};