import { describe, expect, it, beforeAll } from "bun:test";
import { encryptLaravel, decryptLaravel } from "../src/index.js";
import * as crypto from "crypto";

describe("Laravel Encryption", () => {
  let key: Buffer;

  beforeAll(() => {
    // Generate a random 32-byte key for testing
    key = crypto.randomBytes(32);
  });

  it("should encrypt and decrypt a string successfully", () => {
    const plaintext = "Hello, Laravel-Bun encryption!";
    const encrypted = encryptLaravel(key, plaintext);
    
    // Make sure we got a non-empty string back
    expect(encrypted).toBeTruthy();
    expect(typeof encrypted).toBe("string");
    expect(encrypted.length).toBeGreaterThan(0);
    
    // Now decrypt it and verify it matches
    const decrypted = decryptLaravel(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should handle empty strings", () => {
    const plaintext = "";
    const encrypted = encryptLaravel(key, plaintext);
    const decrypted = decryptLaravel(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should handle Unicode characters", () => {
    const plaintext = "¡Hola! こんにちは 😊 مرحبا";
    const encrypted = encryptLaravel(key, plaintext);
    const decrypted = decryptLaravel(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should return null for invalid encrypted data", () => {
    expect(decryptLaravel(key, "invalid-data")).toBeNull();
    expect(decryptLaravel(key, "")).toBeNull();
  });

  it("should detect tampering through MAC verification", () => {
    const plaintext = "This data should be protected";
    const encrypted = encryptLaravel(key, plaintext);
    
    // Tamper with the encrypted data by changing a character
    const tampered = encrypted.substring(0, 10) + "X" + encrypted.substring(11);
    
    // Decryption should fail
    expect(decryptLaravel(key, tampered)).toBeNull();
  });

  it("should throw an error for invalid key size", () => {
    const invalidKey = crypto.randomBytes(16); // Wrong size, should be 32
    const plaintext = "This should fail";
    
    expect(() => encryptLaravel(invalidKey, plaintext)).toThrow();
    expect(() => decryptLaravel(invalidKey, "any-string")).toThrow();
  });
});
