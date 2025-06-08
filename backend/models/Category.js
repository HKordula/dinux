import pool from '../config/db.js';

class Category {
  static async getAll() {
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return categories;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  }
}

export default Category;