import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import constants from '../config/constants.js';

class User {
  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT id, username, email, password, role, status, failed_logins FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT id, username, email, password, role, status
       FROM users 
       WHERE email = ?`,
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, username, email, role, status
       FROM users 
       WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create({ username, email, password, role = 'user', status = 'activated' }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO users 
    (username, email, password, role, status)
    VALUES (?, ?, ?, ?, ?)`,
    [username, email, hashedPassword, role, status]
  );
  return result.insertId;
}

  static async update(id, updates) {
    const validFields = {};
    const allowedFields = ['username', 'email', 'password'];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined && updates[key] !== null) {
        validFields[key] = updates[key];
      }
    });

    if (validFields.password) {
      validFields.password = await bcrypt.hash(validFields.password, 10);
    }

    if (Object.keys(validFields).length === 0) return 0;

    const setClause = Object.keys(validFields)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(validFields);
    values.push(id);

    const [result] = await pool.query(
      `UPDATE users 
      SET ${setClause}
      WHERE id = ?`,
      values
    );

    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }

  static async updateRoleAndStatus(userId, role, status) {
    const [result] = await pool.query(
      'UPDATE users SET role=?, status=? WHERE id=?',
      [role, status, userId]
    );
    return result.affectedRows;
  }

  static async getAll() {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, status, created_at FROM users ORDER BY id'
    );
    return rows;
  }
  
  static async incrementFailedLogins(userId) {
    await pool.query(
      'UPDATE users SET failed_logins = failed_logins + 1 WHERE id = ?',
      [userId]
    );
  }

  static async resetFailedLogins(userId) {
    await pool.query(
      'UPDATE users SET failed_logins = 0 WHERE id = ?',
      [userId]
    );
  }

  static async blockUser(userId) {
    await pool.query(
      'UPDATE users SET status = "blocked" WHERE id = ?',
      [userId]
    );
  }
}

export default User;