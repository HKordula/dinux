import pool from '../config/db.js';

class Favorite {
  static async getFavorites(userId) {
    const [rows] = await pool.query(
      `SELECT d.* FROM favorites f
       JOIN dinosaurs d ON f.dinosaur_id = d.id
       WHERE f.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async addFavorite(userId, dinosaurId) {
    await pool.query(
      `INSERT IGNORE INTO favorites (user_id, dinosaur_id) VALUES (?, ?)`,
      [userId, dinosaurId]
    );
  }

  static async removeFavorite(userId, dinosaurId) {
    const [result] = await pool.query(
      `DELETE FROM favorites WHERE user_id = ? AND dinosaur_id = ?`,
      [userId, dinosaurId]
    );
    return result.affectedRows;
  }
}

export default Favorite;