<?php
/**
 * Laravel-Bun Crypto Interoperability Test Vectors
 * 
 * This script generates test vectors using Laravel's illuminate/encryption component
 * for testing compatibility with the Bun implementation.
 */

require_once 'vendor/autoload.php';

use Illuminate\Encryption\Encrypter;

// Create a test vector file
$output = [
    'info' => [
        'description' => 'Laravel-Bun Crypto test vectors',
        'version' => '1.0',
        'created_at' => date('c'),
        'cipher' => 'AES-256-CBC',
    ],
    'test_vectors' => [],
];

// Generate a key for testing
$key = random_bytes(32);
$keyBase64 = base64_encode($key);

echo "Generated key: " . $keyBase64 . "\n";
echo "Key length: " . strlen($key) . " bytes\n\n";

$output['info']['key_base64'] = $keyBase64;

// Create an encrypter instance
$encrypter = new Encrypter($key, 'AES-256-CBC');

// Generate test vectors with different input types
$testStrings = [
    'empty' => '',
    'simple' => 'Hello, Laravel encryption!',
    'unicode' => '¡Hola! こんにちは 😊 مرحبا',
    'long' => str_repeat('0123456789', 100),
    'special_chars' => "<script>alert('XSS');</script>\n\t\r\"'",
];

foreach ($testStrings as $name => $value) {
    // Encrypt with Laravel
    $encrypted = $encrypter->encryptString($value);
    
    // Decrypt to verify it works
    $decrypted = $encrypter->decryptString($encrypted);
    $success = $decrypted === $value;
    
    // Add to test vectors
    $output['test_vectors'][] = [
        'name' => $name,
        'plaintext' => $value,
        'encrypted' => $encrypted,
        'verified' => $success,
    ];
    
    echo "Test vector: $name\n";
    echo "Plaintext: " . (strlen($value) > 50 ? substr($value, 0, 50) . "..." : $value) . "\n";
    echo "Encrypted: " . substr($encrypted, 0, 50) . "...\n";
    echo "Verification: " . ($success ? "PASSED" : "FAILED") . "\n\n";
}

// Save the test vectors to a JSON file
$jsonFile = 'laravel_vectors.json';
file_put_contents($jsonFile, json_encode($output, JSON_PRETTY_PRINT));
echo "Test vectors saved to: $jsonFile\n";

// Also generate a simple TypeScript file with the test vectors for easy importing
$tsOutput = "/**\n * Generated Laravel encryption test vectors\n */\n\n" .
    "export const laravelVectors = " . json_encode($output, JSON_PRETTY_PRINT) . ";\n";
file_put_contents('laravel_vectors.ts', $tsOutput);
echo "TypeScript vectors saved to: laravel_vectors.ts\n";
