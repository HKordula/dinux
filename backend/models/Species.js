import pool from '../config/db.js';

class Species {
  static async getAll() {
    const [species] = await pool.query(
      'SELECT * FROM species ORDER BY name ASC'
    );
    return species;
  }

  static async create(name, description) {
    const [result] = await pool.query(
      `INSERT INTO species (name, description)
       VALUES (?, ?)`,
      [name, description]
    );
    return result.insertId;
  }

  static async update(id, updates) {
    const validUpdates = {};
    Object.keys(updates).forEach(key => {
      if (['name', 'description'].includes(key)) {
        validUpdates[key] = updates[key];
      }
    });

    if (Object.keys(validUpdates).length === 0) {
      throw new Error('No valid updates provided');
    }

    const setClause = Object.keys(validUpdates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(validUpdates);
    values.push(id);

    const [result] = await pool.query(
      `UPDATE species 
       SET ${setClause}
       WHERE id = ?`,
      values
    );

    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM species WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

export default Species;