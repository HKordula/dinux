import pool from '../config/db.js';

class Era {
  static async getAll() {
    const [eras] = await pool.query(
      'SELECT * FROM eras ORDER BY name ASC'
    );
    return eras;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM eras WHERE id = ?', [id]);
    return rows[0];
  }
}

export default Era;