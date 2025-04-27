/**
 * CryptBridge Example
 * 
 * This example demonstrates how to use CryptBridge to encrypt and decrypt
 * data in a format compatible with Laravel's Crypt facade.
 */
import { encryptLaravel, decryptLaravel } from "../src/index.js";
import * as crypto from "crypto";

// In a real application, you would get this from environment variables
// It should match your Laravel APP_KEY (without the 'base64:' prefix)
const keyBase64 = process.env.APP_KEY?.replace("base64:", "") || 
                 "DNswo09u5AiI3kFnEuQ/GM6D0yDoTRrrA0XzZ4dmwdo=";
const key = Buffer.from(keyBase64, "base64");

// Check if our key is valid
if (key.length !== 32) {
  console.error("Error: Laravel encryption key must be exactly 32 bytes (256 bits)");
  process.exit(1);
}

console.log("Using key:", keyBase64);
console.log("Key buffer length:", key.length, "bytes");

// Example message to encrypt
const message = "Hello from Bun! This message can be decrypted by Laravel.";
console.log("\nOriginal message:", message);

// Encrypt the message (Bun → Laravel)
const encrypted = encryptLaravel(key, message);
console.log("\nEncrypted (compatible with Laravel):", encrypted);

// Decrypt the message (Laravel → Bun)
const decrypted = decryptLaravel(key, encrypted);
console.log("\nDecrypted:", decrypted);

// Verify the round trip was successful
console.log("\nRound-trip successful:", message === decrypted);

// Example of MAC tampering detection
console.log("\n--- Tampering Detection Demo ---");
// Simulate tampering by changing a character in the encrypted string
const tampered = encrypted.substring(0, 20) + "X" + encrypted.substring(21);
console.log("Tampered encrypted string:", tampered.substring(0, 25) + "...");

// Try to decrypt tampered data
const tamperedDecrypted = decryptLaravel(key, tampered);
console.log("Decryption result:", tamperedDecrypted === null ? "REJECTED (good!)" : "Accepted (bad!)");
