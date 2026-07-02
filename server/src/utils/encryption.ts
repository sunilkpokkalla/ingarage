import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_32_bytes!'; // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a secret key for secure storage in the database
 */
export function encrypt(text: string): string {
  let iv = crypto.randomBytes(IV_LENGTH);
  
  // Ensure the key is exactly 32 bytes long for aes-256-cbc
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a secret key from the database for generating payment intents
 */
export function decrypt(text: string): string {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift() as string, 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  
  let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
