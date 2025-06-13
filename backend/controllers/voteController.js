import Vote from '../models/Vote.js';
import asyncHandler from '../utils/asyncHandler.js';
import pool from '../config/db.js';

const castVote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const sessionId = req.params.sessionId;
  const { dinosaurId } = req.body;

  if (!sessionId || !dinosaurId) {
    return res.status(400).json({ success: false, error: 'Missing vote session ID or dinosaur ID' });
  }

  const voteId = await Vote.castVote(userId, dinosaurId, sessionId);
  res.status(201).json({ success: true, voteId });
});

const getVoteResults = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId || req.query.sessionId || req.params.id;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Missing vote session ID' });
  }

  const session = await Vote.getSessionById(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
  }

  const results = await Vote.getSessionResults(sessionId);

  res.json({
    success: true,
    data: {
      session,
      results
    }
  });
});

const createVoteSession = asyncHandler(async (req, res) => {
  const { title, description, choice1_id, choice2_id } = req.body;
  if (!title || !choice1_id || !choice2_id) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  const [result] = await Vote.createSession(title, description, choice1_id, choice2_id);

  try {
    if (req.user && req.user.role === constants.ROLES.ADMIN) {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
        [req.user.id, 'CREATE_VOTE_SESSION', `Created vote session id=${result.insertId}, title=${title}`]
      );
    }
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }

  res.status(201).json({ success: true, sessionId: result.insertId });
});

const updateVoteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, choice1_id, choice2_id } = req.body;

  const oldSession = await Vote.getSessionById(id);

  const affectedRows = await Vote.updateSession(id, { title, description, choice1_id, choice2_id });
  if (affectedRows === 0) {
    return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
  }

  let changes = [];
  if (oldSession) {
    if (title !== undefined && title !== oldSession.title) {
      changes.push(`title: "${oldSession.title}" → "${title}"`);
    }
    if (description !== undefined && description !== oldSession.description) {
      changes.push(`description: "${oldSession.description}" → "${description}"`);
    }
    if (choice1_id !== undefined && choice1_id != oldSession.choice1_id) {
      changes.push(`choice1_id: "${oldSession.choice1_id}" → "${choice1_id}"`);
    }
    if (choice2_id !== undefined && choice2_id != oldSession.choice2_id) {
      changes.push(`choice2_id: "${oldSession.choice2_id}" → "${choice2_id}"`);
    }
  }
  const details = `Updated vote session id=${id}. Changes: ${changes.join(', ')}`;

  try {
    if (req.user && req.user.role === constants.ROLES.ADMIN) {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
        [req.user.id, 'UPDATE_VOTE_SESSION', details]
      );
    }
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }

  res.json({ success: true, message: 'Vote session updated' });
});

const deleteVoteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const affectedRows = await Vote.deleteSession(id);
  if (affectedRows === 0) {
    return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
  }

  try {
    if (req.user && req.user.role === constants.ROLES.ADMIN) {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
        [req.user.id, 'DELETE_VOTE_SESSION', `Deleted vote session id=${id}`]
      );
    }
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }

  res.json({ success: true, message: 'Vote session deleted' });
});

const getAllVoteSessions = asyncHandler(async (req, res) => {
  const sessions = await Vote.getAllSessions();
  res.json({ success: true, data: sessions });
});

export {
  castVote,
  getVoteResults,
  createVoteSession,
  updateVoteSession,
  deleteVoteSession,
  getAllVoteSessions
};