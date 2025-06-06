import express from 'express';
import { getAllDinosaurs, getDinosaurById, getTierList } from '../controllers/dinoController.js';
import Species from '../models/Species.js';

const router = express.Router();

router.get('/dinos', getAllDinosaurs);

router.get('/dinos/:id', getDinosaurById);

router.get('/spiecieses', async (req, res, next) => {
  try {
    const species = await Species.getAll();
    res.json({ success: true, data: species });
  } catch (err) {
    next(err);
  }
});

router.get('/tierlist', getTierList);

export default router;