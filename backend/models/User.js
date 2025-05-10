const pool = require('../config/db');
const bcrypt = require('bcrypt');
const constants = require('../config/constants');

class User {
  static async findByUsername(username) {
    const [rows] = await pool.query(
      `SELECT id, username, email, password, role, created_at
       FROM users 
       WHERE username = ? AND deleted_at IS NULL`,
      [username]
    );
    return rows[0];
  }

  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users 
       (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, constants.ROLES.USER]
    );
    return result.insertId;
  }

  static async update(id, updates) {
    const validFields = {};
    const allowedFields = ['username', 'email', 'password'];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        validFields[key] = updates[key];
      }
    });

    if (validFields.password) {
      validFields.password = await bcrypt.hash(validFields.password, 10);
    }

    const setClause = Object.keys(validFields)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(validFields);
    values.push(id);

    const [result] = await pool.query(
      `UPDATE users 
       SET ${setClause}
       WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query(
      `UPDATE users 
       SET deleted_at = CURRENT_TIMESTAMP()
       WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = User;