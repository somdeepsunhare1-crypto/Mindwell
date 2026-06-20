/**
 * encryption.js
 * --------------------------------------------------
 * Handles AES-256 encryption/decryption for journal entry content.
 *
 * WHY THIS MATTERS (Security Note for README):
 * Journal text is highly sensitive personal data. We encrypt the
 * "content" field BEFORE it is saved to MongoDB, using AES-256
 * (via crypto-js). This means if someone gains direct access to
 * the database (e.g. a malicious admin, a leaked backup, or an
 * attacker who dumps the collection), they will only see unreadable
 * ciphertext - never the user's actual private thoughts.
 *
 * The key used for encryption (ENCRYPTION_KEY) is stored only in
 * server environment variables - never in the database, never in
 * the frontend, and never committed to source control.
 * --------------------------------------------------
 */

const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.ENCRYPTION_KEY;

if (!SECRET_KEY) {
  console.warn('[WARNING] ENCRYPTION_KEY is not set in environment variables!');
}

/**
 * Encrypts a plain text string using AES-256.
 * @param {string} plainText
 * @returns {string} ciphertext
 */
function encrypt(plainText) {
  if (plainText === undefined || plainText === null) return plainText;
  return CryptoJS.AES.encrypt(plainText.toString(), SECRET_KEY).toString();
}

/**
 * Decrypts an AES-256 ciphertext back into plain text.
 * @param {string} cipherText
 * @returns {string} plainText
 */
function decrypt(cipherText) {
  if (cipherText === undefined || cipherText === null) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText.toString(), SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails/garbles, decrypted will be empty - return original as fallback
    return decrypted || cipherText;
  } catch (err) {
    console.error('Decryption error:', err.message);
    return '[Unable to decrypt entry]';
  }
}

module.exports = { encrypt, decrypt };
