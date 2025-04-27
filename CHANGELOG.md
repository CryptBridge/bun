# Changelog

All notable changes to CryptBridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-04-26

### Added
- Initial release of CryptBridge
- AES-256-CBC encryption compatible with Laravel's Crypt::encryptString()
- Timing-safe HMAC-SHA256 verification
- PHP interoperability testing with two methods:
  - JSON vector testing
  - Direct PHP process testing
- TypeScript type definitions
- Comprehensive test suite
- CI/CD integration with GitHub Actions

### Security
- Implements the same security as Laravel's encryption:
  - AES-256-CBC encryption
  - HMAC-SHA256 message authentication code
  - 16-byte random IV for each encryption
  - Timing-safe MAC verification
