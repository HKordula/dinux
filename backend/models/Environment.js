import pool from '../config/db.js';

class Environment {
  static async getAll() {
    const [environments] = await pool.query(
      'SELECT * FROM environments ORDER BY name ASC'
    );
    return environments;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM environments WHERE id = ?', [id]);
    return rows[0];
  }
}

export default Environment;