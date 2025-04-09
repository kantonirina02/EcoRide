# EcoRide

C'est un site de covoiturage

## Installation

### Prerequisites
- PHP >= 8.2
- Composer
- Symfony CLI
- Node.js and npm
- OpenSSL :** Nécessaire pour générer les clés JWT

### Setup Instructions

1. **Cloner le Dépôt :**
    Ouvrez votre terminal dans le dossier où vous souhaitez placer le projet et clonez le dépôt :
    ```bash
    git clone <URL_DE_VOTRE_DEPOT_GIT> EcoRide
    cd EcoRide

2. **Installer les Dépendances Backend (PHP/Symfony) :**

   ```bash
   composer install
```bash

3. **Installer les Dépendances Frontend (Node.js) :**
   Naviguez dans le dossier du frontend (là où se trouve `index.html` et `package.json`) et lancez npm :
    ```bash
    cd ../frontend # Ou le nom/chemin de votre dossier frontend
    npm install

```
4. **Configuration de l'Environnement Backend (`.env`) :**

    *   À la racine du dossier **backend**, copiez le fichier `.env` en `.env.local`

    *   **Ouvrez `.env.local`** et modifiez la ligne `DATABASE_URL` pour correspondre à votre configuration de base de données locale (utilisateur, mot de passe, nom de la base de données - ex: `sf_ecoride`). Assurez-vous que le nom de la base de données existe ou sera créé à l'étape suivante.

        ```dotenv
        # Exemple pour MySQL/MariaDB sans mot de passe pour l'utilisateur root
        DATABASE_URL="mysql://root:@127.0.0.1:3306/sf_ecoride?serverVersion=mariadb-10.4.32&charset=utf8mb4"
        ```

    *   Vérifiez/Configurez les autres variables si nécessaire (normalement `JWT_PASSPHRASE` doit être vide si vous n'avez pas mis de passphrase aux clés, et `CORS_ALLOW_ORIGIN` doit autoriser `http://127.0.0.1:8080` ou votre port frontend).

        ```dotenv
        JWT_PASSPHRASE=
        CORS_ALLOW_ORIGIN=^http?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
        ```

5.  **Générer les Clés JWT (Backend) :**
    Toujours dans le terminal à la racine du dossier **backend** :
    ```bash
    # Créer le dossier s'il manque
    mkdir config/jwt
    # Générer la clé privée (Appuyer sur Entrée deux fois si pas de passphrase)
    openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
    # Générer la clé publique (Entrer la passphrase si définie précédemment)
    openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
    # (Optionnel) Ajouter config/jwt/private.pem à votre .gitignore

   ```

6.  **Créer et Mettre à Jour la Base de Données (Backend) :**
    Toujours dans le terminal à la racine du dossier **backend** :
    ```bash
    # Crée la base de données si elle n'existe pas déjà
    php bin/console doctrine:database:create --if-not-exists

    # Crée (ou vérifie) le fichier de migration basé sur vos entités
    php bin/console make:migration

    # Applique les migrations pour créer/modifier les tables
    php bin/console doctrine:migrations:migrate --no-interaction
    ```
7.  **Charger les Données Initiales (Fixtures - Si vous en avez) :**
    Si vous avez créé des fixtures (par exemple pour les Rôles) :
    ```bash
    # Charge les fixtures (attention, --purge vide les tables avant)
    php bin/console doctrine:fixtures:load --no-interaction 
    ```
8.  **Vider le Cache Symfony (Backend) :**
    ```bash
    php bin/console cache:clear
    ```
### Lancement de l'Application

Vous devez lancer **deux** serveurs en parallèle dans **deux terminaux distincts** :

1.  **Terminal 1 : Lancer le Serveur Backend (Symfony)**
    *   Naviguez jusqu'au dossier **backend** (`cd chemin/vers/EcoRide/backend`).
    *   Lancez le serveur Symfony :
        ```bash
        symfony server:start -d
        ```

.  **Terminal 2 : Lancer le Serveur Frontend (live-server)**
    *   Naviguez jusqu'au dossier **frontend** (`cd chemin/vers/EcoRide/frontend` ou juste `cd ../frontend` si vous étiez dans backend).
    *   Lancez `live-server` avec la configuration de fallback :
        ```bash
        # Méthode via package.json (si configuré)
        npm run dev
        # OU Méthode via fichier config
        # live-server --config=live-server-config.js --verbose
        # OU Méthode simple fallback
        # live-server --entry-file=index.html --verbose
        ```
    *   Votre navigateur devrait s'ouvrir sur l'application frontend (ex: `http://127.0.0.1:8080`).
