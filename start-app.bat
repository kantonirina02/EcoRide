@echo off
echo 🚀 Démarrage rapide d'EcoRide
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
echo Vérification de l'environnement...
echo.

REM Vérifier si on est dans le bon dossier
if not exist "backend" (
    call :print_error "Dossier 'backend' non trouvé. Exécutez ce script depuis la racine du projet."
    pause
    exit /b 1
)

REM Vérifier si les dépendances sont installées
if not exist "backend\vendor" (
    call :print_warning "Dépendances backend non installées"
    call :print_status "Installation des dépendances..."
    cd backend
    if exist "composer.json" (
        composer install --no-interaction
        if %errorlevel% neq 0 (
            call :print_error "Erreur lors de l'installation des dépendances"
            pause
            exit /b 1
        )
    )
    cd ..
)

REM Vérifier si les dépendances frontend sont installées
if not exist "node_modules" (
    call :print_warning "Dépendances frontend non installées"
    call :print_status "Installation des dépendances frontend..."
    npm install
    if %errorlevel% neq 0 (
        call :print_error "Erreur lors de l'installation des dépendances frontend"
        pause
        exit /b 1
    )
)

echo.
call :print_status "Configuration de la base de données..."

REM Vérifier si la base de données existe
cd backend
php bin/console doctrine:database:create --if-not-exists >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "Impossible de créer la base de données automatiquement"
    call :print_status "Vérifiez votre configuration dans .env"
)

REM Exécuter les migrations
call :print_status "Exécution des migrations..."
php bin/console doctrine:migrations:migrate --no-interaction >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "Erreur lors des migrations"
)

REM Charger les fixtures
call :print_status "Chargement des données de test..."
php bin/console doctrine:fixtures:load --no-interaction >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "Erreur lors du chargement des fixtures"
)

cd ..
echo.
call :print_status "Démarrage des serveurs..."

REM Démarrer le serveur backend
start "Backend - EcoRide" cmd /k "cd backend && php bin/console cache:clear && symfony server:start -d --port=8000"
if %errorlevel% neq 0 (
    call :print_warning "Impossible de démarrer le serveur backend automatiquement"
    call :print_status "Démarrez-le manuellement : cd backend && symfony server:start"
)

REM Attendre un peu
timeout /t 3 /nobreak >nul

REM Vérifier si le serveur backend répond
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "Serveur backend non accessible sur le port 8000"
) else (
    call :print_success "Serveur backend démarré sur http://localhost:8000"
)

REM Démarrer le serveur frontend
start "Frontend - EcoRide" cmd /k "npm run dev"
if %errorlevel% neq 0 (
    call :print_warning "Impossible de démarrer le serveur frontend automatiquement"
    call :print_status "Démarrez-le manuellement : npm run dev"
)

REM Attendre un peu
timeout /t 2 /nobreak >nul

REM Vérifier si le serveur frontend répond
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "Serveur frontend non accessible sur le port 8080"
) else (
    call :print_success "Serveur frontend démarré sur http://localhost:8080"
)

echo.
call :print_success "Application EcoRide démarrée !"
echo.
call :print_status "URLs d'accès :"
echo "  Frontend : http://localhost:8080"
echo "  Backend API : http://localhost:8000/api"
echo "  Admin : http://localhost:8000/admin"
echo.
call :print_status "Comptes de test :"
echo "  Admin : admin@ecoride.com / admin123"
echo "  User : jean.martin@example.com / password123"
echo.
call :print_status "Pour arrêter les serveurs :"
echo "  Backend : Appuyez sur Ctrl+C dans la fenêtre Backend"
echo "  Frontend : Appuyez sur Ctrl+C dans la fenêtre Frontend"
echo.
pause
