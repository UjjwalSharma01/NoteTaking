/**
 * Client-side encryption utilities using Web Crypto API
 * Implements AES-256-GCM encryption with PBKDF2 key derivation
 */

// Configuration constants
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generate a cryptographically secure random IV
 */
export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive encryption key from password using PBKDF2
 */
export async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive AES-GCM key
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encryptData(data, key, iv) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: TAG_LENGTH * 8
    },
    key,
    dataBuffer
  );
  
  return new Uint8Array(encryptedBuffer);
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decryptData(encryptedData, key, iv) {
  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: TAG_LENGTH * 8
      },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedString);
  } catch (error) {
    throw new Error('Decryption failed: Invalid key or corrupted data');
  }
}

/**
 * Convert Uint8Array to base64 string for storage
 */
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binary);
}

/**
 * Convert base64 string back to Uint8Array
 */
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt note content with user's master key
 */
export async function encryptNote(noteContent, userPassword, userSalt) {
  try {
    // Derive key from user's password
    const key = await deriveKey(userPassword, userSalt);
    
    // Generate random IV for this encryption
    const iv = generateIV();
    
    // Encrypt the note content
    const encryptedData = await encryptData(noteContent, key, iv);
    
    // Return encrypted package
    return {
      data: arrayBufferToBase64(encryptedData),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(userSalt)
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt note content with user's master key
 */
export async function decryptNote(encryptedPackage, userPassword) {
  try {
    // Convert base64 back to arrays
    const encryptedData = base64ToArrayBuffer(encryptedPackage.data);
    const iv = base64ToArrayBuffer(encryptedPackage.iv);
    const salt = base64ToArrayBuffer(encryptedPackage.salt);
    
    // Derive key from user's password
    const key = await deriveKey(userPassword, salt);
    
    // Decrypt the data
    return await decryptData(encryptedData, key, iv);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Generate a secure password hash for authentication (separate from encryption)
 */
export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Validate encryption support in current browser
 */
export function isEncryptionSupported() {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues !== 'undefined'
  );
}

/**
 * Generate a secure master password suggestion
 */
export function generateSecurePassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues, byte => charset[byte % charset.length]).join('');
}
