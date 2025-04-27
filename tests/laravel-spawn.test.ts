import { describe, expect, it, test } from "bun:test";
import { encryptLaravel, decryptLaravel } from "../src/index.js";
import { spawnSync } from "child_process";
import * as crypto from "crypto";

/**
 * This test verifies compatibility with Laravel's encryption system
 * by directly spawning PHP processes to encrypt and decrypt data
 * 
 * To run this test properly:
 * 1. First go to php-interop directory
 * 2. Run `composer install` to install illuminate/encryption
 * 3. Run this test with `bun test`
 */

const phpPath = Bun.which("php") ?? "php";           // find PHP binary
const phpDir = new URL("../php-interop/", import.meta.url).pathname;
const encPHP = `${phpDir}encrypt.php`;
const decPHP = `${phpDir}decrypt.php`;

// Check if PHP and interop files exist
const phpExists = (() => {
  try {
    const result = spawnSync(phpPath, ["--version"], { encoding: "utf8" });
    return result.status === 0;
  } catch (e) {
    return false;
  }
})();

const interopFilesExist = (() => {
  try {
    const phpEncrypt = Bun.file(encPHP);
    const phpDecrypt = Bun.file(decPHP);
    return phpEncrypt.size > 0 && phpDecrypt.size > 0;
  } catch (e) {
    return false;
  }
})();

function phpExec(cmd: string, ...args: string[]): string {
  const res = spawnSync(phpPath, [cmd, ...args], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(res.stderr || "PHP error");
  return res.stdout.trim();
}

describe("Laravel PHP Interoperability", () => {
  it("should have PHP and interoperability files available", () => {
    if (!phpExists) {
      console.warn("\nPHP not found in PATH. Skipping Laravel spawn tests.");
    }
    
    if (!interopFilesExist) {
      console.warn(
        "\nLaravel interoperability files not found. To set them up:\n" +
        "1. cd php-interop\n" +
        "2. composer install\n"
      );
    }
    
    // This is not a hard failure since it might be run in environments
    // without PHP, but we'll indicate it was skipped
    if (!phpExists || !interopFilesExist) {
      console.log("Skipping Laravel PHP spawn tests");
    }
  });

  // Only run these tests if PHP is available and interop files exist
  if (phpExists && interopFilesExist) {
    const key = crypto.randomBytes(32);
    const keyB64 = Buffer.from(key).toString("base64");
    
    test("Bun → Laravel → Bun", () => {
      const plain = "hello from Bun ↔ PHP";
      const blob = encryptLaravel(key, plain);
      const phpPlain = phpExec(decPHP, keyB64, blob);
      expect(phpPlain).toBe(plain);
      expect(decryptLaravel(key, blob)).toBe(plain);
    });
    
    test("Laravel → Bun → Laravel", () => {
      const plain = "hello from PHP ↔ Bun";
      const blob = phpExec(encPHP, keyB64, plain);
      expect(decryptLaravel(key, blob)).toBe(plain);
      const phpPlain = phpExec(decPHP, keyB64, blob);
      expect(phpPlain).toBe(plain);
    });
    
    test("Unicode handling across platforms", () => {
      const plain = "¡Hola! こんにちは 😊 مرحبا";
      const blob = phpExec(encPHP, keyB64, plain);
      expect(decryptLaravel(key, blob)).toBe(plain);
      
      const bunBlob = encryptLaravel(key, plain);
      const phpPlain = phpExec(decPHP, keyB64, bunBlob);
      expect(phpPlain).toBe(plain);
    });
  }
});
