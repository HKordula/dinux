import express from 'express';
import { getAllDinosaurs, getDinosaurById, getTierList } from '../controllers/dinoController.js';
import {
  getAllSpecies,
  getSpeciesById
} from '../controllers/speciesController.js';

const router = express.Router();

router.get('/dinos', getAllDinosaurs);
router.get('/dinos/:id', getDinosaurById);

router.get('/species', getAllSpecies);
router.get('/species/:id', getSpeciesById);

router.get('/tierlist', getTierList);

export default router;