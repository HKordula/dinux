import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import {
  createUser,
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
  getAllVoteSessions
} from '../controllers/voteController.js';
import {
  createSpecies,
  updateSpecies,
  deleteSpecies
} from '../controllers/speciesController.js';

const router = express.Router();

// diunos
router.post('/dinos', authenticate, authorizeAdmin, createDinosaur);
router.put('/dinos/:id', authenticate, authorizeAdmin, updateDinosaur);
router.delete('/dinos/:id', authenticate, authorizeAdmin, deleteDinosaur);
router.get('/metadata/', authenticate, authorizeAdmin, getMetadata);

// users
router.post('/users', authenticate, authorizeAdmin, createUser);
router.get('/users', authenticate, authorizeAdmin, manageUsers);
router.delete('/users/:id', authenticate, authorizeAdmin, deleteUser);
router.put('/users/:id/status', authenticate, authorizeAdmin, updateUserStatus);
router.put('/users/:id/reset-password', authenticate, authorizeAdmin, resetUserPassword);

// species
router.post('/species', authenticate, authorizeAdmin, createSpecies);
router.put('/species/:id', authenticate, authorizeAdmin, updateSpecies);
router.delete('/species/:id', authenticate, authorizeAdmin, deleteSpecies);

// vote sessions
router.post('/vote', authenticate, authorizeAdmin, createVoteSession);
router.put('/vote/:id', authenticate, authorizeAdmin, updateVoteSession);
router.delete('/vote/:id', authenticate, authorizeAdmin, deleteVoteSession);
router.get('/vote', authenticate, authorizeAdmin, getAllVoteSessions);

export default router;