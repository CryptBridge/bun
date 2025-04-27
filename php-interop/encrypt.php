#!/usr/bin/env php
<?php
require __DIR__.'/vendor/autoload.php';

// Usage: php encrypt.php <base64_key> <plaintext>
if ($argc < 3) {
  echo "Usage: php encrypt.php <base64_key> <plaintext>\n";
  exit(1);
}

$key = base64_decode($argv[1], true);
$plain = $argv[2];

$enc = new Illuminate\Encryption\Encrypter($key, 'AES-256-CBC');
echo $enc->encryptString($plain);
