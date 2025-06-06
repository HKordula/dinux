import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  manageUsers,
  updateUserStatus,
  resetUserPassword
} from '../controllers/adminController.js';
import {
  createDinosaur,
  updateDinosaur,
  deleteDinosaur
} from '../controllers/dinoController.js';
import {
  createVoteSession,
  updateVoteSession,
  deleteVoteSession,
  getAllVoteSessions
} from '../controllers/voteController.js';

const router = express.Router();

// Dinosaur management
router.post('/dinos', authenticate, authorize('admin'), createDinosaur);
router.put('/dinos/:id', authenticate, authorize('admin'), updateDinosaur);
router.delete('/dinos/:id', authenticate, authorize('admin'), deleteDinosaur);

// User management
router.get('/users', authenticate, authorize('admin'), manageUsers);
router.delete('/users/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const affectedRows = await User.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});
router.put('/users/:id/status', authenticate, authorize('admin'), updateUserStatus);
router.put('/users/:id/reset-password', authenticate, authorize('admin'), resetUserPassword);

// Vote session
router.post('/vote', authenticate, authorize('admin'), createVoteSession);
router.put('/vote/:id', authenticate, authorize('admin'), updateVoteSession);
router.delete('/vote/:id', authenticate, authorize('admin'), deleteVoteSession);
router.get('/vote', authenticate, authorize('admin'), getAllVoteSessions);

export default router;