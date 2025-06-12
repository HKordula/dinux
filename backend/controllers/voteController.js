import Vote from '../models/Vote.js';
import asyncHandler from '../utils/asyncHandler.js';

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
    return res.status(404).json({ success: false, error: 'Vote session not found' });
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
  res.status(201).json({ success: true, sessionId: result.insertId });
});

const updateVoteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, choice1_id, choice2_id } = req.body;
  const affectedRows = await Vote.updateSession(id, { title, description, choice1_id, choice2_id });
  if (affectedRows === 0) {
    return res.status(404).json({ success: false, error: 'Vote session not found' });
  }
  res.json({ success: true, message: 'Vote session updated' });
});

const deleteVoteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const affectedRows = await Vote.deleteSession(id);
  if (affectedRows === 0) {
    return res.status(404).json({ success: false, error: 'Vote session not found' });
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