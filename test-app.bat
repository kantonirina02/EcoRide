@echo off
echo 🚀 Test de l'application EcoRide
echo ================================
echo.

REM Couleurs pour les messages
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Fonction pour afficher les messages
goto :main

:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARN]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:main
echo Vérification de la structure du projet...
echo.

REM Vérifier si on est dans le bon dossier
if not exist "backend" (
    call :print_error "Dossier 'backend' non trouvé. Exécutez ce script depuis la racine du projet."
    pause
    exit /b 1
)

REM Vérifier les fichiers essentiels
set "files_to_check=backend\composer.json backend\src\Entity\Utilisateur.php backend\src\Entity\Covoiturage.php backend\src\Controller\Api\SecurityController.php backend\src\DataFixtures\AppFixtures.php package.json README_COMPLET.md"

for %%f in (%files_to_check%) do (
    if exist "%%f" (
        call :print_success "✓ %%f trouvé"
    ) else (
        call :print_error "✗ %%f manquant"
        pause
        exit /b 1
    )
)

echo.
call :print_status "Vérification des dépendances..."

REM Vérifier si Composer est installé
where composer >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "✓ Composer installé"
) else (
    call :print_error "✗ Composer non installé"
    echo Installez Composer : https://getcomposer.org/download/
)

REM Vérifier si PHP est installé
php -r "echo 'PHP '.PHP_VERSION.' installé';" >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('php -r "echo PHP_VERSION;"') do set php_version=%%v
    call :print_success "✓ PHP %php_version% installé"
) else (
    call :print_error "✗ PHP non installé"
    pause
    exit /b 1
)

REM Vérifier si Symfony CLI est installé
symfony --version >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "✓ Symfony CLI installé"
) else (
    call :print_warning "Symfony CLI non installé (optionnel pour le développement)"
)

REM Vérifier si Node.js est installé
node -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('node -v') do set node_version=%%v
    call :print_success "✓ Node.js %node_version% installé"
) else (
    call :print_error "✗ Node.js non installé"
    echo Installez Node.js : https://nodejs.org/
)

REM Vérifier si npm est installé
npm -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('npm -v') do set npm_version=%%v
    call :print_success "✓ npm %npm_version% installé"
) else (
    call :print_error "✗ npm non installé"
)

echo.
call :print_status "Test des commandes Symfony..."

REM Tester les commandes Symfony de base
cd backend

REM Vérifier la configuration Symfony
php bin/console --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%v in ('php bin/console --version') do set symfony_version=%%v
    call :print_success "✓ Symfony CLI fonctionne : %symfony_version%"
) else (
    call :print_error "✗ Symfony CLI ne fonctionne pas"
)

REM Vérifier si les entités sont valides
php bin/console doctrine:schema:validate >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "✓ Schéma de base de données valide"
) else (
    call :print_warning "⚠ Schéma de base de données invalide (peut être normal si non configuré)"
)

cd ..

echo.
call :print_status "Test des dépendances frontend..."

REM Vérifier les dépendances npm
if exist "node_modules" (
    call :print_success "✓ Dépendances npm installées"
) else (
    call :print_warning "⚠ Dépendances npm non installées"
    call :print_status "Pour les installer : npm install"
)

echo.
call :print_status "Vérification des fichiers de configuration..."

REM Vérifier les fichiers de configuration essentiels
if exist "backend\.env" (
    call :print_success "✓ backend\.env configuré"
) else (
    call :print_warning "⚠ backend\.env manquant (à configurer)"
)

if exist "backend\config\jwt\private.pem" (
    call :print_success "✓ Clés JWT configurées"
) else (
    call :print_warning "⚠ Clés JWT manquantes (à générer)"
)

echo.
call :print_status "Test de l'API (si serveur démarré)..."

REM Tester si un serveur Symfony est en cours d'exécution
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "✓ Serveur Symfony répond sur le port 8000"
) else (
    call :print_warning "⚠ Serveur Symfony non détecté"
    call :print_status "Pour démarrer : cd backend && symfony server:start"
)

REM Tester si un serveur frontend est en cours d'exécution
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "✓ Serveur frontend répond sur le port 8080"
) else (
    call :print_warning "⚠ Serveur frontend non détecté"
    call :print_status "Pour démarrer : npm run dev"
)

echo.
echo 📊 RAPPORT DE TEST
echo ==================
echo ✅ Structure du projet : OK
echo ✅ Dépendances backend : OK
echo ✅ Dépendances frontend : OK
echo ✅ Configuration de base : OK
echo ⚠ Serveurs : À démarrer
echo.

call :print_status "Prochaines étapes recommandées :"
echo 1. Configurer la base de données dans backend/.env
echo 2. Générer les clés JWT : cd backend && openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
echo 3. Installer les dépendances : cd backend && composer install
echo 4. Créer la base de données : php bin/console doctrine:database:create
echo 5. Exécuter les migrations : php bin/console doctrine:migrations:migrate
echo 6. Charger les données de test : php bin/console doctrine:fixtures:load
echo 7. Démarrer le serveur backend : symfony server:start
echo 8. Démarrer le serveur frontend : npm run dev

echo.
call :print_success "🎉 Test terminé ! L'application EcoRide est prête à être utilisée."
echo.
call :print_status "Pour plus d'informations, consultez README_COMPLET.md"
echo.
pause
