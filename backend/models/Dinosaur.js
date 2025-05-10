const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const constants = require('../config/constants');

class Dinosaur {
  static async create({ name, species_id, description, era_id, diet_id, size, weight, image_url, categories = [], environments = [] }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [dinoResult] = await connection.query(
        `INSERT INTO dinosaurs 
        (name, species_id, description, era_id, diet_id, size, weight, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, species_id, description, era_id, diet_id, size, weight, image_url]
      );
      const dinosaurId = dinoResult.insertId;

      if (categories.length > 0) {
        await connection.query(
          `INSERT INTO dinosaur_categories (dinosaur_id, group_id)
          VALUES ?`,
          [categories.map(cat => [dinosaurId, cat])]
        );
      }

      if (environments.length > 0) {
        await connection.query(
          `INSERT INTO dinosaur_environments (dinosaur_id, environment_id)
          VALUES ?`,
          [environments.map(env => [dinosaurId, env])]
        );
      }

      await connection.commit();
      return dinosaurId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT d.*, 
        s.name AS species, 
        e.name AS era, 
        di.name AS diet,
        GROUP_CONCAT(DISTINCT c.name) AS categories,
        GROUP_CONCAT(DISTINCT env.name) AS environments
      FROM dinosaurs d
      LEFT JOIN species s ON d.species_id = s.id
      LEFT JOIN eras e ON d.era_id = e.id
      LEFT JOIN diets di ON d.diet_id = di.id
      LEFT JOIN dinosaur_categories dc ON d.id = dc.dinosaur_id
      LEFT JOIN categories c ON dc.group_id = c.id
      LEFT JOIN dinosaur_environments de ON d.id = de.dinosaur_id
      LEFT JOIN environments env ON de.environment_id = env.id
    `;

    const whereClauses = [];
    const params = [];

    if (filters.species) {
      whereClauses.push('s.name = ?');
      params.push(filters.species);
    }
    if (filters.diet) {
      whereClauses.push('di.name = ?');
      params.push(filters.diet);
    }
    if (filters.era) {
      whereClauses.push('e.name = ?');
      params.push(filters.era);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ' GROUP BY d.id';

    const [dinosaurs] = await pool.query(query, params);
    return dinosaurs;
  }

  static async findById(id) {
    const [dinosaurs] = await pool.query(
      `SELECT d.*, 
        s.name AS species, 
        e.name AS era, 
        di.name AS diet
      FROM dinosaurs d
      LEFT JOIN species s ON d.species_id = s.id
      LEFT JOIN eras e ON d.era_id = e.id
      LEFT JOIN diets di ON d.diet_id = di.id
      WHERE d.id = ?`,
      [id]
    );
    return dinosaurs[0];
  }

  static async update(id, updates) {
    const validFields = {};
    const allowedFields = ['name', 'species_id', 'description', 'era_id', 'diet_id', 'size', 'weight', 'image_url'];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        validFields[key] = updates[key];
      }
    });

    const setClause = Object.keys(validFields)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(validFields);
    values.push(id);

    const [result] = await pool.query(
      `UPDATE dinosaurs 
       SET ${setClause}
       WHERE id = ?`,
      values
    );

    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM dinosaurs WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Dinosaur;