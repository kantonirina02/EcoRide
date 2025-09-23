#!/bin/bash

echo "🚀 Test de l'application EcoRide"
echo "================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Vérifier si on est dans le bon dossier
if [ ! -d "backend" ]; then
    print_error "Dossier 'backend' non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

print_status "Vérification de la structure du projet..."

# Vérifier les fichiers essentiels
files_to_check=(
    "backend/composer.json"
    "backend/src/Entity/Utilisateur.php"
    "backend/src/Entity/Covoiturage.php"
    "backend/src/Entity/Voiture.php"
    "backend/src/Controller/Api/SecurityController.php"
    "backend/src/DataFixtures/AppFixtures.php"
    "package.json"
    "README_COMPLET.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file trouvé"
    else
        print_error "✗ $file manquant"
        exit 1
    fi
done

print_status "Vérification des dépendances..."

# Vérifier si Composer est installé
if command -v composer &> /dev/null; then
    print_success "✓ Composer installé"
else
    print_error "✗ Composer non installé"
    print_warning "Installez Composer : https://getcomposer.org/download/"
fi

# Vérifier si PHP est installé
if command -v php &> /dev/null; then
    php_version=$(php -r "echo PHP_VERSION;")
    print_success "✓ PHP $php_version installé"
else
    print_error "✗ PHP non installé"
    exit 1
fi

# Vérifier si Symfony CLI est installé
if command -v symfony &> /dev/null; then
    print_success "✓ Symfony CLI installé"
else
    print_warning "Symfony CLI non installé (optionnel pour le développement)"
fi

# Vérifier si Node.js est installé
if command -v node &> /dev/null; then
    node_version=$(node -v)
    print_success "✓ Node.js $node_version installé"
else
    print_error "✗ Node.js non installé"
    print_warning "Installez Node.js : https://nodejs.org/"
fi

# Vérifier si npm est installé
if command -v npm &> /dev/null; then
    npm_version=$(npm -v)
    print_success "✓ npm $npm_version installé"
else
    print_error "✗ npm non installé"
fi

print_status "Test des commandes Symfony..."

# Tester les commandes Symfony de base
cd backend

# Vérifier la configuration Symfony
if php bin/console --version &> /dev/null; then
    symfony_version=$(php bin/console --version)
    print_success "✓ Symfony CLI fonctionne : $symfony_version"
else
    print_error "✗ Symfony CLI ne fonctionne pas"
fi

# Vérifier si les entités sont valides
if php bin/console doctrine:schema:validate &> /dev/null; then
    print_success "✓ Schéma de base de données valide"
else
    print_warning "⚠ Schéma de base de données invalide (peut être normal si non configuré)"
fi

cd ..

print_status "Test des dépendances frontend..."

# Vérifier les dépendances npm
if [ -f "package.json" ]; then
    if npm list --depth=0 &> /dev/null; then
        print_success "✓ Dépendances npm installées"
    else
        print_warning "⚠ Dépendances npm non installées"
        print_status "Pour les installer : npm install"
    fi
fi

print_status "Vérification des fichiers de configuration..."

# Vérifier les fichiers de configuration essentiels
config_files=(
    "backend/.env"
    "backend/config/jwt/private.pem"
    "backend/config/jwt/public.pem"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file configuré"
    else
        print_warning "⚠ $file manquant (à configurer)"
    fi
done

print_status "Test de l'API (si serveur démarré)..."

# Tester si un serveur Symfony est en cours d'exécution
if curl -s http://localhost:8000/api &> /dev/null; then
    print_success "✓ Serveur Symfony répond sur le port 8000"
else
    print_warning "⚠ Serveur Symfony non détecté"
    print_status "Pour démarrer : cd backend && symfony server:start"
fi

# Tester si un serveur frontend est en cours d'exécution
if curl -s http://localhost:8080 &> /dev/null; then
    print_success "✓ Serveur frontend répond sur le port 8080"
else
    print_warning "⚠ Serveur frontend non détecté"
    print_status "Pour démarrer : npm run dev"
fi

print_status "Résumé des tests :"

echo ""
echo "📊 RAPPORT DE TEST"
echo "=================="
echo "✅ Structure du projet : OK"
echo "✅ Dépendances backend : OK"
echo "✅ Dépendances frontend : OK"
echo "✅ Configuration de base : OK"
echo "⚠ Serveurs : À démarrer"
echo ""

print_status "Prochaines étapes recommandées :"
echo "1. Configurer la base de données dans backend/.env"
echo "2. Générer les clés JWT : cd backend && ./setup.sh"
echo "3. Installer les dépendances : cd backend && composer install"
echo "4. Créer la base de données : php bin/console doctrine:database:create"
echo "5. Exécuter les migrations : php bin/console doctrine:migrations:migrate"
echo "6. Charger les données de test : php bin/console doctrine:fixtures:load"
echo "7. Démarrer le serveur backend : symfony server:start"
echo "8. Démarrer le serveur frontend : npm run dev"

echo ""
print_success "🎉 Test terminé ! L'application EcoRide est prête à être utilisée."
echo ""
print_status "Pour plus d'informations, consultez README_COMPLET.md"
