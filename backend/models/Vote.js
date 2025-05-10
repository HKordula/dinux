const pool = require('../config/db');
const constants = require('../config/constants');

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
}

module.exports = Vote;