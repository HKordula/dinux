import User from '../models/User.js';
import Dinosaur from '../models/Dinosaur.js';
import Favorite from '../models/Favorite.js';
import Vote from '../models/Vote.js';
import asyncHandler from '../utils/asyncHandler.js';

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // lets not send password :3
  const { password, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.getFavorites(req.user.id);
  res.json({
    success: true,
    count: favorites.length,
    data: favorites
  });
});

const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { dinoId } = req.body;

    const dino = await Dinosaur.findById(dinoId);
    if (!dino) {
      return res.status(404).json({ success: false, error: 'Dinosaur not found' });
    }

    await Favorite.addFavorite(userId, dinoId);
    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    next(err);
  }
};

const removeFavorite = asyncHandler(async (req, res) => {
  const affectedRows = await Favorite.removeFavorite(req.user.id, req.params.dinoId);
  if (affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: 'Favorite not found'
    });
  }
  res.json({
    success: true,
    message: 'Dinosaur removed from favorites'
  });
});

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const newUsername = username || user.username;
    const newEmail = email || user.email;

    await User.update(userId, { username: newUsername, email: newEmail, password });
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

const deleteAccount = asyncHandler(async (req, res) => {
  await User.delete(req.user.id);
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

const getMyVotedSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const sessions = await Vote.getSessionsVotedByUser(userId);
  res.json({ success: true, data: sessions });
});

export {
  getMe,
  getFavorites,
  addFavorite,
  removeFavorite,
  updateProfile,
  deleteAccount,
  getMyVotedSessions
};