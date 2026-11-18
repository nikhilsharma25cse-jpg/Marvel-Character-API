const mongoose = require('mongoose');
const Character = require('../models/Character');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const isRequestBody = (body) =>
  body !== null && typeof body === 'object' && !Array.isArray(body);

const handleValidationError = (error, res, next) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
};

const createCharacter = async (req, res, next) => {
  if (!isRequestBody(req.body)) {
    return res.status(400).json({ message: 'A JSON object is required.' });
  }

  const { name, alias, team, powers, description, firstAppearance } = req.body;

  try {
    const character = await Character.create({
      name,
      alias,
      team,
      powers,
      description,
      firstAppearance,
      createdBy: req.user._id,
    });

    return res.status(201).json({ character });
  } catch (error) {
    return handleValidationError(error, res, next);
  }
};

const getCharacters = async (req, res, next) => {
  try {
    const characters = await Character.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ characters });
  } catch (error) {
    return next(error);
  }
};

const getCharacterById = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid character ID.' });
  }

  try {
    const character = await Character.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!character) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    return res.status(200).json({ character });
  } catch (error) {
    return next(error);
  }
};

const updateCharacter = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid character ID.' });
  }

  if (!isRequestBody(req.body)) {
    return res.status(400).json({ message: 'A JSON object is required.' });
  }

  const allowedFields = [
    'name',
    'alias',
    'team',
    'powers',
    'description',
    'firstAppearance',
  ];
  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Provide at least one valid character field to update.' });
  }

  try {
    const character = await Character.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    if (!character) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    return res.status(200).json({ character });
  } catch (error) {
    return handleValidationError(error, res, next);
  }
};

const deleteCharacter = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid character ID.' });
  }

  try {
    const character = await Character.findByIdAndDelete(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    return res.status(200).json({ message: 'Character deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
};
