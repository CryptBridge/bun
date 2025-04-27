/**
 * Type definitions for the Laravel Bun Crypto library
 */

/**
 * Structure of the encrypted payload produced by Laravel's Crypt::encryptString()
 * This is the JSON structure that's base64-encoded in the final encrypted string
 */
export interface EncryptedPayload {
  /** Base64-encoded initialization vector (16 bytes) */
  iv: string;
  /** Base64-encoded encrypted value */
  value: string;
  /** HMAC-SHA256 message authentication code in hex format */
  mac: string;
  /** Authentication tag for GCM mode (empty for CBC mode) */
  tag: string;
}
