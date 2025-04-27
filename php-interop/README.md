# PHP Interoperability for Laravel-Bun Crypto

This directory contains the PHP components needed to test interoperability between the Laravel `illuminate/encryption` component and the CryptBridge Bun/TypeScript implementation.

## Setup

1. Install PHP dependencies:

```bash
composer install
```

This will install only the necessary `illuminate/encryption` component and its dependencies (≈ 0.4 MB total).

## Available Tools

### Test Vector Generation

Generate test vectors for JSON-based testing:

```bash
php test-vectors.php
```

This creates `tests/laravel_vectors.json` and `tests/laravel_vectors.ts` files with test vectors for various types of input (empty strings, simple strings, Unicode, etc.)

### Direct Encryption CLI

Encrypt a string using Laravel's encryption:

```bash
php encrypt.php <base64_key> <plaintext>
# Example: php encrypt.php vGt8omAPmfvGPTyj4z+JjAhFfPh+KLruV9bpFFFqvso= "Hello world"
```

### Direct Decryption CLI

Decrypt a Laravel-encrypted string:

```bash
php decrypt.php <base64_key> <encrypted_blob>
# Example: php decrypt.php vGt8omAPmfvGPTyj4z+JjAhFfPh+KLruV9bpFFFqvso= "eyJpdiI6IkFObz0iLCJ2YWx1ZSI6IkExOD0iLCJtYWMiOiIxMjM0In0="
```

## How It's Used

These tools are used in two ways:

1. **JSON Vector Testing**: The `test-vectors.php` script generates static test vectors that are used by `tests/laravel-compat.test.ts`.

2. **Direct Process Testing**: The `encrypt.php` and `decrypt.php` scripts are used by `tests/laravel-spawn.test.ts` to perform real-time cross-language testing.

## CI Integration

In CI environments, this directory's tools can be set up with:

```bash
composer install --working-dir=php-interop --no-interaction --no-progress
