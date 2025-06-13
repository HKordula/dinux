import pool from '../config/db.js';

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
          `INSERT INTO dinosaur_categories (dinosaur_id, group_id) VALUES ${categories.map(() => '(?, ?)').join(', ')}`,
          categories.flatMap(cat => [dinosaurId, cat])
        );
      }

      if (environments.length > 0) {
        await connection.query(
          `INSERT INTO dinosaur_environments (dinosaur_id, environment_id) VALUES ${environments.map(() => '(?, ?)').join(', ')}`,
          environments.flatMap(env => [dinosaurId, env])
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
        GROUP_CONCAT(DISTINCT c.id) AS category_ids,
        GROUP_CONCAT(DISTINCT env.id) AS environment_ids,
        COUNT(DISTINCT f.user_id) AS likes
      FROM dinosaurs d
      LEFT JOIN species s ON d.species_id = s.id
      LEFT JOIN eras e ON d.era_id = e.id
      LEFT JOIN diets di ON d.diet_id = di.id
      LEFT JOIN dinosaur_categories dc ON d.id = dc.dinosaur_id
      LEFT JOIN categories c ON dc.group_id = c.id
      LEFT JOIN dinosaur_environments de ON d.id = de.dinosaur_id
      LEFT JOIN environments env ON de.environment_id = env.id
      LEFT JOIN favorites f ON d.id = f.dinosaur_id
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
    return dinosaurs.map(dino => ({
      ...dino,
      categories: dino.category_ids ? dino.category_ids.split(',').map(Number) : [],
      environments: dino.environment_ids ? dino.environment_ids.split(',').map(Number) : [],
      likes: Number(dino.likes) || 0
    }));
  }

  static async findById(id) {
    const [dinosaurs] = await pool.query(
      `SELECT d.*, 
        s.name AS species, 
        e.name AS era, 
        di.name AS diet,
        GROUP_CONCAT(DISTINCT c.id) AS category_ids,
        GROUP_CONCAT(DISTINCT env.id) AS environment_ids,
        COUNT(DISTINCT f.user_id) AS likes
      FROM dinosaurs d
      LEFT JOIN species s ON d.species_id = s.id
      LEFT JOIN eras e ON d.era_id = e.id
      LEFT JOIN diets di ON d.diet_id = di.id
      LEFT JOIN dinosaur_categories dc ON d.id = dc.dinosaur_id
      LEFT JOIN categories c ON dc.group_id = c.id
      LEFT JOIN dinosaur_environments de ON d.id = de.dinosaur_id
      LEFT JOIN environments env ON de.environment_id = env.id
      LEFT JOIN favorites f ON d.id = f.dinosaur_id
      WHERE d.id = ?
      GROUP BY d.id`,
      [id]
    );
    const dino = dinosaurs[0];
      return {
      ...dino,
      categories: dino.category_ids ? dino.category_ids.split(',').map(Number) : [],
      environments: dino.environment_ids ? dino.environment_ids.split(',').map(Number) : [],
      likes: Number(dino.likes) || 0
    };
  }

static async update(id, updates) {
    const validFields = {};
    const allowedFields = ['name', 'species_id', 'description', 'era_id', 'diet_id', 'size', 'weight', 'image_url'];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        validFields[key] = updates[key];
      }
    });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (Object.keys(validFields).length > 0) {
        const setClause = Object.keys(validFields)
          .map(key => `${key} = ?`)
          .join(', ');
        const values = Object.values(validFields);
        values.push(id);

        await connection.query(
          `UPDATE dinosaurs 
           SET ${setClause}
           WHERE id = ?`,
          values
        );
      }

      if (Array.isArray(updates.categories)) {
        await connection.query('DELETE FROM dinosaur_categories WHERE dinosaur_id = ?', [id]);
        if (updates.categories.length > 0) {
          await connection.query(
            `INSERT INTO dinosaur_categories (dinosaur_id, group_id) VALUES ${updates.categories.map(() => '(?, ?)').join(', ')}`,
            updates.categories.flatMap(cat => [id, cat])
          );
        }
      }

      if (Array.isArray(updates.environments)) {
        await connection.query('DELETE FROM dinosaur_environments WHERE dinosaur_id = ?', [id]);
        if (updates.environments.length > 0) {
          await connection.query(
            `INSERT INTO dinosaur_environments (dinosaur_id, environment_id) VALUES ${updates.environments.map(() => '(?, ?)').join(', ')}`,
            updates.environments.flatMap(env => [id, env])
          );
        }
      }

      await connection.commit();
      return 1;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
}

  static async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM dinosaurs WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }

  static async getTierList() {
    const [rows] = await pool.query(`
      SELECT d.id, d.name, COUNT(v.id) AS votes
      FROM dinosaurs d
      LEFT JOIN votes v ON d.id = v.dinosaur_id
      GROUP BY d.id
      ORDER BY votes DESC, d.name ASC
    `);
    return [rows];
  }
}

export default Dinosaur;