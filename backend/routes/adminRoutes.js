import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  manageUsers,
  updateUserStatus,
  resetUserPassword,
  deleteUser
} from '../controllers/adminController.js';
import {
  createDinosaur,
  updateDinosaur,
  deleteDinosaur,
  getMetadata
} from '../controllers/dinoController.js';
import {
  createVoteSession,
  updateVoteSession,
  deleteVoteSession,
  getAllVoteSessions,
  getVoteResults
} from '../controllers/voteController.js';
import {
  createSpecies,
  updateSpecies,
  deleteSpecies
} from '../controllers/speciesController.js';

const router = express.Router();

// Dinosaur management
router.post('/dinos', authenticate, authorize('admin'), createDinosaur);
router.put('/dinos/:id', authenticate, authorize('admin'), updateDinosaur);
router.delete('/dinos/:id', authenticate, authorize('admin'), deleteDinosaur);
router.get('/metadata/', authenticate, authorize('admin'), getMetadata);


// User management
router.get('/users', authenticate, authorize('admin'), manageUsers);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
router.put('/users/:id/status', authenticate, authorize('admin'), updateUserStatus);
router.put('/users/:id/reset-password', authenticate, authorize('admin'), resetUserPassword);

// Species
router.post('/species', authenticate, authorize('admin'), createSpecies);
router.put('/species/:id', authenticate, authorize('admin'), updateSpecies);
router.delete('/species/:id', authenticate, authorize('admin'), deleteSpecies);

// Vote session
router.post('/vote', authenticate, authorize('admin'), createVoteSession);
router.put('/vote/:id', authenticate, authorize('admin'), updateVoteSession);
router.delete('/vote/:id', authenticate, authorize('admin'), deleteVoteSession);
router.get('/vote', authenticate, authorize('admin'), getAllVoteSessions);

export default router;