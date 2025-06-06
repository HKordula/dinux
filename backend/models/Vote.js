import pool from '../config/db.js';
import constants from '../config/constants.js';

class Vote {
  static async castVote(userId, dinosaurId, sessionId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [existing] = await connection.query(
        `SELECT id FROM votes 
         WHERE user_id = ? AND vote_session_id = ?`,
        [userId, sessionId]
      );

      if (existing.length > 0) {
        throw new Error('User already voted in this session');
      }

      const [result] = await connection.query(
        `INSERT INTO votes 
         (user_id, dinosaur_id, vote_session_id)
         VALUES (?, ?, ?)`,
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

  static async createSession(title, description) {
    return pool.query('INSERT INTO vote_sessions (title, description) VALUES (?, ?)', [title, description]);
  }

  static async updateSession(id, { title, description }) {
    const [result] = await pool.query('UPDATE vote_sessions SET title=?, description=? WHERE id=?', [title, description, id]);
    return result.affectedRows;
  }

  static async deleteSession(id) {
    const [result] = await pool.query('DELETE FROM vote_sessions WHERE id=?', [id]);
    return result.affectedRows;
  }
  
  static async getAllSessions() {
    const [rows] = await pool.query('SELECT * FROM vote_sessions');
    return rows;
  }

  static async getSessionsVotedByUser(userId) {
    const [rows] = await pool.query(
      `SELECT DISTINCT vote_session_id FROM votes WHERE user_id = ?`,
      [userId]
    );
    return rows;
  }
}

export default Vote;