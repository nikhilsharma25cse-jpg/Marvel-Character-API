const express = require('express');
const {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
} = require('../controllers/characterController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCharacters);
router.get('/:id', getCharacterById);
router.post('/', protect, createCharacter);
router.put('/:id', protect, updateCharacter);
router.delete('/:id', protect, deleteCharacter);

module.exports = router;
