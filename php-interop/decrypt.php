#!/usr/bin/env php
<?php
require __DIR__.'/vendor/autoload.php';

// Usage: php decrypt.php <base64_key> <encrypted_blob>
if ($argc < 3) {
  echo "Usage: php decrypt.php <base64_key> <encrypted_blob>\n";
  exit(1);
}

$key = base64_decode($argv[1], true);
$blob = $argv[2];

$enc = new Illuminate\Encryption\Encrypter($key, 'AES-256-CBC');
echo $enc->decryptString($blob);
