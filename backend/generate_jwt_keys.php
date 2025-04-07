<?php
$passphrase = 'YourStrongPassphraseHere';
$privateKeyPath = 'config/jwt/private.pem';
$publicKeyPath = 'config/jwt/public.pem';

// Créer le répertoire si nécessaire
if (!file_exists('config/jwt')) {
    mkdir('config/jwt', 0700, true);
}

// Configurer les paramètres OpenSSL
$config = [
    'digest_alg' => 'sha512',
    'private_key_bits' => 4096,
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
];

// Générer la paire de clés
$res = openssl_pkey_new($config);
if (!$res) {
    die('Erreur lors de la génération des clés: ' . openssl_error_string());
}

// Exporter la clé privée
openssl_pkey_export($res, $privateKey, $passphrase);

// Exporter la clé publique
$publicKey = openssl_pkey_get_details($res);
$publicKey = $publicKey['key'];

// Sauvegarder les clés
file_put_contents($privateKeyPath, $privateKey);
file_put_contents($publicKeyPath, $publicKey);

echo "Clés JWT générées avec succès!\n";
echo "Clé privée: $privateKeyPath\n";
echo "Clé publique: $publicKeyPath\n";
