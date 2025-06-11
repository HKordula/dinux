import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMe,
  getFavorites,
  addFavorite,
  removeFavorite,
  updateProfile,
  deleteAccount,
  getMyVotedSessions
} from '../controllers/userController.js';
import { castVote, getVoteResults } from '../controllers/voteController.js';

const router = express.Router();

// Favorites
router.get('/favorites', authenticate, getFavorites);
router.post('/favorites', authenticate, addFavorite);
router.delete('/favorites/:dinoId', authenticate, removeFavorite);

// User account
router.get('/users/me', authenticate, getMe);
router.put('/users/update', authenticate, updateProfile);
router.delete('/users/delete', authenticate, deleteAccount);

// Voting
router.post('/vote/:dinoId', authenticate, castVote);
router.get('/vote/:sessionId', authenticate, getVoteResults);
router.get('/vote/sessions/mine', authenticate, getMyVotedSessions);

export default router;