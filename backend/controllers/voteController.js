import Vote from '../models/Vote.js';
import asyncHandler from '../utils/asyncHandler.js';

const castVote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const dinosaurId = req.params.dinoId;
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Missing vote session ID' });
  }

  const voteId = await Vote.castVote(userId, dinosaurId, sessionId);
  res.status(201).json({ success: true, voteId });
});

const getVoteResults = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Missing vote session ID' });
  }

  const results = await Vote.getSessionResults(sessionId);
  res.json({ success: true, data: results });
});

const createVoteSession = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const [result] = await Vote.createSession(title, description);
  res.status(201).json({ success: true, sessionId: result.insertId });
});

const updateVoteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const affectedRows = await Vote.updateSession(id, { title, description });
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