import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
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
import constants from '../config/constants.js';

const router = express.Router();

// Dinosaur management
router.post('/dinos', authenticate, authorize(constants.ROLES.ADMIN), createDinosaur);
router.put('/dinos/:id', authenticate, authorize(constants.ROLES.ADMIN), updateDinosaur);
router.delete('/dinos/:id', authenticate, authorize(constants.ROLES.ADMIN), deleteDinosaur);
router.get('/metadata/', authenticate, authorize(constants.ROLES.ADMIN), getMetadata);


// User management
router.post('/users', authenticate, authorize(constants.ROLES.ADMIN), createUser);
router.get('/users', authenticate, authorize(constants.ROLES.ADMIN), manageUsers);
router.delete('/users/:id', authenticate, authorize(constants.ROLES.ADMIN), deleteUser);
router.put('/users/:id/status', authenticate, authorize(constants.ROLES.ADMIN), updateUserStatus);
router.put('/users/:id/reset-password', authenticate, authorize(constants.ROLES.ADMIN), resetUserPassword);

// Species
router.post('/species', authenticate, authorize(constants.ROLES.ADMIN), createSpecies);
router.put('/species/:id', authenticate, authorize(constants.ROLES.ADMIN), updateSpecies);
router.delete('/species/:id', authenticate, authorize(constants.ROLES.ADMIN), deleteSpecies);

// Vote session
router.post('/vote', authenticate, authorize(constants.ROLES.ADMIN), createVoteSession);
router.put('/vote/:id', authenticate, authorize(constants.ROLES.ADMIN), updateVoteSession);
router.delete('/vote/:id', authenticate, authorize(constants.ROLES.ADMIN), deleteVoteSession);
router.get('/vote', authenticate, authorize(constants.ROLES.ADMIN), getAllVoteSessions);

export default router;