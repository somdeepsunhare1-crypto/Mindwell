const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * JournalEntry Schema
 * --------------------
 * The "content" field is ALWAYS stored encrypted (AES-256).
 * We use a Mongoose "set" transform to encrypt automatically
 * whenever content is assigned, and a "get" transform to decrypt
 * automatically whenever it's read back in application code.
 *
 * This means: in MongoDB itself, content is permanently ciphertext.
 * Decryption only ever happens in server memory, never in the DB.
 */
const journalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String, // the guided prompt shown to the user, not sensitive
      default: '',
    },
    content: {
      type: String,
      required: true,
      set: (value) => encrypt(value), // encrypt before saving
      get: (value) => decrypt(value), // decrypt when accessed in code
    },
    mood: {
      type: Number, // 1-10 scale
      min: 1,
      max: 10,
      required: true,
    },
    energy: {
      type: Number, // 1-10 scale
      min: 1,
      max: 10,
      default: 5,
    },
    emotion: {
      type: String, // e.g. "Happy", "Anxious", "Calm", "Sad", "Excited"
      default: 'Neutral',
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true }, // ensures decrypted value is used when sending as JSON
    toObject: { getters: true },
  }
);

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
