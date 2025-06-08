import pool from '../config/db.js';

class Diet {
  static async getAll() {
    const [diets] = await pool.query(
      'SELECT * FROM diets ORDER BY name ASC'
    );
    return diets;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM diets WHERE id = ?', [id]);
    return rows[0];
  }
}

export default Diet;