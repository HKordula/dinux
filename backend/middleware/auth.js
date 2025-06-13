import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import constants from '../config/constants.js';

const authenticate = async (req, res, next) => {
  try {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await pool.query(
      `SELECT id, username, email, role, created_at 
       FROM users 
       WHERE id = ?`,
      [decoded.userId]
    );

    if (!users.length) {
      throw new Error('User belonging to this token no longer exists');
    }

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

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== constants.ROLES.ADMIN) {
    const error = new Error('Admin access required');
    error.statusCode = 403;
    return next(error);
  }
  next();
};

export { authenticate, authorizeAdmin };