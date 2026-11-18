const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    alias: {
      type: String,
      required: [true, 'Alias is required.'],
      trim: true,
    },
    team: {
      type: String,
      enum: [
        'Avengers',
        'X-Men',
        'Guardians of the Galaxy',
        'Defenders',
        'Unaffiliated',
      ],
    },
    powers: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    firstAppearance: {
      type: Number,
      min: [1939, 'First appearance cannot be earlier than 1939.'],
      max: [2026, 'First appearance cannot be later than 2026.'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A creator is required.'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Character', characterSchema);
