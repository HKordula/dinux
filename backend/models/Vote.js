import pool from '../config/db.js';
import constants from '../config/constants.js';

class Vote {
  static async castVote(userId, dinosaurId, sessionId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [sessions] = await connection.query(
        'SELECT choice1_id, choice2_id FROM vote_sessions WHERE id = ?',
        [sessionId]
      );
      if (!sessions.length) throw new Error('Vote session not found');
      const { choice1_id, choice2_id } = sessions[0];
      if (![choice1_id, choice2_id].includes(Number(dinosaurId))) {
        throw new Error('Invalid dinosaur choice for this session');
      }

      // check if user already voted
      const [existing] = await connection.query(
        'SELECT id FROM votes WHERE user_id = ? AND vote_session_id = ?',
        [userId, sessionId]
      );
      if (existing.length > 0) {
        throw new Error('User already voted in this session');
      }

      // insert vote
      const [result] = await connection.query(
        'INSERT INTO votes (user_id, dinosaur_id, vote_session_id) VALUES (?, ?, ?)',
        [userId, dinosaurId, sessionId]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getSessionResults(sessionId) {
    const [results] = await pool.query(
      `SELECT 
        d.id,
        d.name,
        COUNT(v.id) AS vote_count,
        RANK() OVER (ORDER BY COUNT(v.id) DESC) AS ranking
       FROM votes v
       JOIN dinosaurs d ON v.dinosaur_id = d.id
       WHERE v.vote_session_id = ?
       GROUP BY d.id
       ORDER BY vote_count DESC`,
      [sessionId]
    );
    
    return results;
  }

  static async getUserVotes(userId) {
    const [votes] = await pool.query(
      `SELECT v.*, s.title AS session_title 
       FROM votes v
       JOIN vote_sessions s ON v.vote_session_id = s.id
       WHERE v.user_id = ?`,
      [userId]
    );
    return votes;
  }

  static async createSession(title, description, choice1_id, choice2_id) {
    return pool.query(
      'INSERT INTO vote_sessions (title, description, choice1_id, choice2_id) VALUES (?, ?, ?, ?)',
      [title, description, choice1_id, choice2_id]
    );
  }

  static async getSessionById(sessionId) {
    const [rows] = await pool.query(
      `SELECT vs.*, d1.name AS choice1_name, d2.name AS choice2_name
      FROM vote_sessions vs
      JOIN dinosaurs d1 ON vs.choice1_id = d1.id
      JOIN dinosaurs d2 ON vs.choice2_id = d2.id
      WHERE vs.id = ?`,
      [sessionId]
    );
    return rows[0];
  }

  static async updateSession(id, { title, description, choice1_id, choice2_id }) {
    const [result] = await pool.query(
      'UPDATE vote_sessions SET title=?, description=?, choice1_id=?, choice2_id=? WHERE id=?',
      [title, description, choice1_id, choice2_id, id]
    );
    return result.affectedRows;
  }

  static async deleteSession(id) {
    const [result] = await pool.query('DELETE FROM vote_sessions WHERE id=?', [id]);
    return result.affectedRows;
  }
  
  static async getAllSessions() {
    const [rows] = await pool.query(
      `SELECT vs.*, d1.name AS choice1_name, d2.name AS choice2_name
      FROM vote_sessions vs
      JOIN dinosaurs d1 ON vs.choice1_id = d1.id
      JOIN dinosaurs d2 ON vs.choice2_id = d2.id`
    );
    return rows;
  }

  static async getSessionsVotedByUser(userId) {
    const [rows] = await pool.query(
      `SELECT 
          vs.id AS session_id, 
          vs.title, 
          vs.description,
          d.id AS dinosaur_id,
          d.name AS dinosaur_name
      FROM votes v
      JOIN vote_sessions vs ON v.vote_session_id = vs.id
      JOIN dinosaurs d ON v.dinosaur_id = d.id
      WHERE v.user_id = ?
      GROUP BY vs.id, vs.title, vs.description, d.id, d.name`,
      [userId]
    );
    return rows;
  }
}

export default Vote;