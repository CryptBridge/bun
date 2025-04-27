import * as crypto from "crypto"; 
import { Base64 } from "js-base64";
import * as phpSerialize from "php-serialize";
import type { EncryptedPayload } from "./types.js";

/**
 * Decrypts Laravel Crypt::encryptString() payload securely
 * 
 * This function verifies the HMAC-SHA256 message authentication code using timing-safe comparison
 * before attempting decryption, providing protection against tampering.
 *
 * @param keyBuffer - 32-byte Buffer, decoded from Laravel's base64 APP_KEY
 * @param encryptedString - The base64 encrypted string from Laravel
 * @returns Decrypted value or null if verification fails
 * 
 * @example
 * ```typescript
 * import { decryptLaravel } from 'laravel-bun-crypto';
 * 
 * // Get your Laravel APP_KEY (remove 'base64:' prefix if present)
 * const key = Buffer.from(process.env.APP_KEY.replace('base64:', ''), 'base64');
 * 
 * // Decrypt data from Laravel
 * const decrypted = decryptLaravel(key, encryptedString);
 * if (decrypted === null) {
 *   console.error('Decryption failed or MAC verification failed');
 * } else {
 *   console.log('Decrypted:', decrypted);
 * }
 * ```
 */
export function decryptLaravel(keyBuffer: Buffer | Uint8Array, encryptedString: string): string | null {
    if (!encryptedString) return null;

    if (keyBuffer.length !== 32) {
      throw new Error("Laravel encryption key must be exactly 32 bytes (256 bits)");
    }

    try {
        // Parse the encrypted data
        const decoded = Base64.decode(encryptedString);
        const payload = JSON.parse(decoded) as EncryptedPayload;

        // Components as they appear in the JSON
        const ivStr = payload.iv;      // base64 string
        const valStr = payload.value;  // base64 string
        const storedMac = payload.mac;

        // Laravel hashes the **strings** ivStr + valStr
        const calculatedMac = crypto.createHmac("sha256", keyBuffer)
            .update(ivStr + valStr, "utf8")
            .digest("hex");

        // Now decode them for real decryption
        const iv = Buffer.from(ivStr, "base64");
        const value = Buffer.from(valStr, "base64");

        // Verify MAC using constant time comparison
        const expectedMacBuffer = Buffer.from(storedMac, 'hex');
        const calculatedMacBuffer = Buffer.from(calculatedMac, 'hex');
        
        if (expectedMacBuffer.length !== calculatedMacBuffer.length || 
            !crypto.timingSafeEqual(expectedMacBuffer, calculatedMacBuffer)) {
            return null;
        }

        // Decrypt
        const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
        let decrypted = decipher.update(value);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        // Convert to string
        const decryptedStr = decrypted.toString('utf8');

        try {
            // Try to unserialize as PHP often serializes data before encryption
            const unserialized = phpSerialize.unserialize(decryptedStr) as unknown;
            
            // Check if it's null/false from unserialization or actually the intended value
            if (unserialized !== null && unserialized !== false) {
                return String(unserialized);
            } else if (decryptedStr === 'b:0;' || decryptedStr === 'N;') {
                // Handle cases where PHP serialized false or null
                return String(unserialized);
            }
            
            // If unserialize returns null/false but the string wasn't 'N;' or 'b:0;'
            // it might be a raw string that happens to look like serialized data
            return decryptedStr;
        } catch (error) {
            // If unserialization fails, return the raw string
            return decryptedStr;
        }
    } catch (err) {
        return null;
    }
}
