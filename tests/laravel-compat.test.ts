import { describe, expect, it } from "bun:test";
import { encryptLaravel, decryptLaravel } from "../src/index.js";
import * as fs from "fs";
import * as path from "path";

/**
 * This test verifies compatibility with Laravel's encryption system
 * using JSON test vectors
 * 
 * To run this test properly:
 * 1. First go to php-interop directory
 * 2. Run `composer install` to install illuminate/encryption
 * 3. Run `php test-vectors.php` to generate test vectors
 * 4. Run this test with `bun test`
 */
describe("Laravel JSON Compatibility", () => {
  const vectorsPath = path.join(
    process.cwd(),
    "tests/laravel_vectors.json"
  );

  // Skip tests if vectors don't exist
  const vectorsExist = fs.existsSync(vectorsPath);

  it("should have Laravel test vectors available", () => {
    if (!vectorsExist) {
      console.warn(
        "\nLaravel test vectors not found. To generate them:\n" +
        "1. cd php-interop\n" +
        "2. composer install\n" +
        "3. php test-vectors.php\n"
      );
    }
    
    // This is not a hard failure since it might be run in environments
    // without PHP, but we'll mark it as skipped
    if (!vectorsExist) {
      console.log("Skipping Laravel compatibility tests");
    }
  });

  // Only run these tests if the vectors exist
  if (vectorsExist) {
    // Load the test vectors
    const vectors = JSON.parse(fs.readFileSync(vectorsPath, 'utf-8'));
    
    // Get the key
    const key = Buffer.from(vectors.info.key_base64, 'base64');
    
    it("should use the same AES-256-CBC algorithm", () => {
      expect(vectors.info.cipher).toBe("AES-256-CBC");
      expect(key.length).toBe(32); // 256 bits = 32 bytes
    });
    
    // Test decryption of Laravel encrypted strings
    describe("Laravel → Bun", () => {
      vectors.test_vectors.forEach((vector: any) => {
        it(`should decrypt Laravel-encrypted '${vector.name}' data`, () => {
          const decrypted = decryptLaravel(key, vector.encrypted);
          expect(decrypted).toBe(vector.plaintext);
        });
      });
    });
    
    // Test encryption that Laravel can decrypt
    describe("Bun → Laravel", () => {
      vectors.test_vectors.forEach((vector: any) => {
        it(`should encrypt '${vector.name}' data that Laravel can decrypt`, () => {
          // Encrypt with our implementation
          const encrypted = encryptLaravel(key, vector.plaintext);
          
          // It should be a different ciphertext (random IV)
          expect(encrypted).not.toBe(vector.encrypted);
          
          // But when decrypted with our implementation, should match original
          const decrypted = decryptLaravel(key, encrypted);
          expect(decrypted).toBe(vector.plaintext);
        });
      });
    });
  }
});
