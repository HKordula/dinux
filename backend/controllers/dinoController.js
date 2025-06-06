import Dinosaur from '../models/Dinosaur.js';
import asyncHandler from '../utils/asyncHandler.js';

const getAllDinosaurs = asyncHandler(async (req, res) => {
  const filters = {
    species: req.query.species,
    diet: req.query.diet,
    era: req.query.era
  };
  const dinosaurs = await Dinosaur.findAll(filters);
  res.json({
    success: true,
    count: dinosaurs.length,
    data: dinosaurs
  });
});

const getDinosaurById = asyncHandler(async (req, res) => {
  const dinosaur = await Dinosaur.findById(req.params.id);
  if (!dinosaur) {
    return res.status(404).json({
      success: false,
      error: 'Dinosaur not found'
    });
  }
  res.json({
    success: true,
    data: dinosaur
  });
});

const createDinosaur = asyncHandler(async (req, res) => {
  const dinosaurId = await Dinosaur.create({
    ...req.body,
    categories: req.body.categories || [],
    environments: req.body.environments || []
  });
  res.status(201).json({
    success: true,
    data: { id: dinosaurId }
  });
});

const updateDinosaur = asyncHandler(async (req, res) => {
  const affectedRows = await Dinosaur.update(req.params.id, req.body);
  if (affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: 'Dinosaur not found'
    });
  }
  res.json({
    success: true,
    message: 'Dinosaur updated successfully'
  });
});

const deleteDinosaur = asyncHandler(async (req, res) => {
  const affectedRows = await Dinosaur.delete(req.params.id);
  if (affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: 'Dinosaur not found'
    });
  }
  res.json({
    success: true,
    message: 'Dinosaur deleted successfully'
  });
});

const getTierList = asyncHandler(async (req, res) => {
  const [tierList] = await Dinosaur.getTierList();
  res.json({ success: true, data: tierList });
});

export {
  getAllDinosaurs,
  getDinosaurById,
  createDinosaur,
  updateDinosaur,
  deleteDinosaur,
  getTierList
};