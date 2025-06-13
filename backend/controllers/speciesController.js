import Species from '../models/Species.js';
import asyncHandler from '../utils/asyncHandler.js';

const getAllSpecies = asyncHandler(async (req, res) => {
  const species = await Species.getAll();
  res.json({ success: true, data: species });
});

const getSpeciesById = asyncHandler(async (req, res) => {
  const species = await Species.findById(req.params.id);
  if (!species) {
    return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
  }
  res.json({ success: true, data: species });
});

const createSpecies = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }
  const id = await Species.create(name, description || '');
  res.status(201).json({ success: true, data: { id, name, description } });
});

const updateSpecies = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name && !description) {
    return res.status(400).json({ success: false, error: 'No valid updates provided' });
  }
  const affectedRows = await Species.update(req.params.id, { name, description });
  if (affectedRows === 0) {
    return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
  }
  res.json({ success: true, message: 'Species updated' });
});

const deleteSpecies = asyncHandler(async (req, res) => {
  const affectedRows = await Species.delete(req.params.id);
  if (affectedRows === 0) {
    return res.status(404).json({ success: false, error: constants.ERROR_MESSAGES.NOT_FOUND });
  }
  res.json({ success: true, message: 'Species deleted' });
});

export {
  getAllSpecies,
  getSpeciesById,
  createSpecies,
  updateSpecies,
  deleteSpecies
};