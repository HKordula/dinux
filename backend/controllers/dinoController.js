import Dinosaur from '../models/Dinosaur.js';
import Species from '../models/Species.js';
import Diet from '../models/Diet.js';
import Era from '../models/Era.js';
import Category from '../models/Category.js';
import Environment from '../models/Environment.js';
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

const getMetadata = asyncHandler(async (req, res) => {
    try {
        const [species, diets, eras, categories, environments] = await Promise.all([
            Species.getAll(),
            Diet.getAll(),
            Era.getAll(),
            Category.getAll(),
            Environment.getAll()
        ]);
        res.json({ species, diets, eras, categories, environments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Nie udało się pobrać metadanych' });
    }
});

export {
  getAllDinosaurs,
  getDinosaurById,
  createDinosaur,
  updateDinosaur,
  deleteDinosaur,
  getTierList,
  getMetadata
};