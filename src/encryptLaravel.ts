import * as crypto from "crypto";
import { Base64 } from "js-base64";
import type { EncryptedPayload } from "./types.js";

/**
 * Encrypt a UTF-8 string so that Laravel's Crypt::decryptString() can read it.
 *
 * Algorithm & format exactly match Laravel (AES-256-CBC, HMAC-SHA256 over
 * base64(iv)+base64(ciphertext), JSON payload, then base64-encoded).
 *
 * @param keyBuffer - 32-byte Buffer decoded from Laravel's base64 APP_KEY
 * @param plaintext - The string to encrypt
 * @returns A base64 string identical to Laravel Crypt::encryptString()
 * 
 * @example
 * ```typescript
 * import { encryptLaravel } from 'laravel-bun-crypto';
 * 
 * // Get your Laravel APP_KEY (remove 'base64:' prefix if present)
 * const key = Buffer.from(process.env.APP_KEY.replace('base64:', ''), 'base64');
 * 
 * // Encrypt data
 * const encrypted = encryptLaravel(key, 'Secret message');
 * 
 * // 'encrypted' can now be stored or sent to a Laravel application
 * // where it can be decrypted with Crypt::decryptString()
 * ```
 */
export function encryptLaravel(
  keyBuffer: Buffer | Uint8Array,
  plaintext: string,
): string {
  if (keyBuffer.length !== 32) {
    throw new Error("Laravel encryption key must be exactly 32 bytes (256 bits)");
  }

  // 1. 16-byte random IV
  const iv = crypto.randomBytes(16);

  // 2. AES-256-CBC encrypt
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  // 3. Base64 strings (exactly like Laravel)
  const ivStr = iv.toString("base64");
  const valStr = encrypted.toString("base64");

  // 4. MAC = HMAC-SHA256( ivStr + valStr )
  const mac = crypto
    .createHmac("sha256", keyBuffer)
    .update(ivStr + valStr, "utf8")
    .digest("hex");

  // 5. Build Laravel payload
  const payload: EncryptedPayload = {
    iv: ivStr,
    value: valStr,
    mac: mac,
    tag: "", // empty for CBC mode (Laravel includes it anyway)
  };

  // 6. Base64-encode the JSON
  return Base64.encode(JSON.stringify(payload));
}
