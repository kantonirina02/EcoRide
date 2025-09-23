#!/bin/bash

echo "🚀 Configuration d'EcoRide - Application de covoiturage écologique"
echo "================================================================="

# Vérifier si on est dans le bon répertoire
if [ ! -f "composer.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis le répertoire backend/"
    exit 1
fi

echo "📦 Installation des dépendances PHP..."
composer install --no-interaction

echo "🗄️  Configuration de la base de données..."
if [ -f "../.env" ]; then
    echo "✅ Fichier .env trouvé"
else
    echo "⚠️  Fichier .env non trouvé, création d'un fichier .env d'exemple..."
    cp .env.example .env 2>/dev/null || echo "Veuillez créer le fichier .env manuellement"
fi

echo "🔐 Génération des clés JWT..."
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

echo "🗃️  Création de la base de données..."
php bin/console doctrine:database:create --if-not-exists

echo "📊 Exécution des migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

echo "🌱 Chargement des données de test..."
php bin/console doctrine:fixtures:load --no-interaction

echo "🧹 Nettoyage du cache..."
php bin/console cache:clear

echo "✅ Configuration terminée avec succès!"
echo ""
echo "📋 Informations de connexion pour les tests:"
echo "   👤 Admin: admin@ecoride.com / admin123"
echo "   👤 Utilisateur: jean.dupont@example.com / password123"
echo "   👤 Utilisateur: marie.martin@example.com / password123"
echo ""
echo "🔗 Pour démarrer l'application:"
echo "   php bin/console cache:clear"
echo "   symfony server:start -d"
echo ""
echo "🌐 L'application sera accessible sur http://127.0.0.1:8000"
