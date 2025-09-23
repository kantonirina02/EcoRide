# EcoRide - Plateforme de Covoiturage

## Description

EcoRide est une plateforme web complète de covoiturage développée avec Symfony 7 et un frontend JavaScript moderne. L'application permet aux utilisateurs de proposer et réserver des trajets en covoiturage, de gérer leurs véhicules, d'échanger des avis et de bénéficier d'un système de notifications intégré.

## Fonctionnalités

### 🚗 Fonctionnalités Principales
- **Gestion des utilisateurs** : Inscription, connexion, profils personnalisés
- **Gestion des véhicules** : Ajout, modification et suppression de voitures
- **Covoiturages** : Création, réservation et gestion des trajets
- **Système d'avis** : Notation et commentaires entre utilisateurs
- **Notifications** : Système de notifications en temps réel
- **Administration** : Panel d'administration complet avec statistiques

### 🔧 Fonctionnalités Avancées
- **Système de rôles** : Gestion fine des permissions (Admin, User)
- **Statistiques détaillées** : Dashboard avec métriques complètes
- **API REST** : Interface complète pour intégrations tierces
- **Gestion des crédits** : Système de crédits pour les réservations
- **Validation des données** : Contrôles de sécurité et de cohérence
- **Fixtures de test** : Données d'exemple pour développement

## Architecture Technique

### Backend (Symfony 7)
- **Framework** : Symfony 7.2
- **Base de données** : Doctrine ORM
- **Authentification** : JWT (LexikJWTAuthenticationBundle)
- **Sécurité** : Symfony Security Bundle
- **API** : RESTful API avec sérialisation JSON
- **Validation** : Symfony Validator
- **Tests** : PHPUnit (structure prête)

### Frontend
- **JavaScript Vanilla** : Code modulaire et maintenable
- **Bootstrap 5** : Interface responsive et moderne
- **Live Server** : Développement en temps réel
- **Architecture modulaire** : Organisation en modules (auth, admin, etc.)

### Base de Données
- **Entités principales** :
  - `Utilisateur` : Gestion des comptes utilisateurs
  - `Voiture` : Véhicules des conducteurs
  - `Covoiturage` : Trajets proposés
  - `Avis` : Système de notation
  - `Notification` : Messages système
  - `Role` : Gestion des permissions
  - `Marque` : Référence des marques automobiles

## Installation et Configuration

### Prérequis
- PHP >= 8.2
- Composer
- Symfony CLI
- Node.js et npm
- OpenSSL (pour les clés JWT)
- Base de données (MySQL/MariaDB recommandé)

### Installation

1. **Cloner le projet**
```bash
git clone <votre-repo> EcoRide
cd EcoRide
```

2. **Backend - Installation des dépendances**
```bash
cd backend
composer install
```

3. **Configuration de l'environnement**
```bash
cp .env .env.local
# Éditer .env.local avec vos paramètres de base de données
```

4. **Génération des clés JWT**
```bash
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
```

5. **Configuration de la base de données**
```bash
# Dans .env.local
DATABASE_URL="mysql://user:password@127.0.0.1:3306/ecoride?serverVersion=mariadb-10.4.32&charset=utf8mb4"
```

6. **Création et migration de la base**
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

7. **Chargement des données de test**
```bash
php bin/console doctrine:fixtures:load
```

8. **Frontend - Installation**
```bash
cd ../  # Retour au dossier racine
npm install
```

### Démarrage des serveurs

1. **Backend (Terminal 1)**
```bash
cd backend
symfony server:start -d
```

2. **Frontend (Terminal 2)**
```bash
npm run dev
# Ou : live-server --config=live-server-config.js
```

## Utilisation

### Comptes de test
Après chargement des fixtures, vous pouvez utiliser :

**Compte Administrateur :**
- Email : admin@ecoride.com
- Mot de passe : admin123

**Comptes Utilisateurs :**
- jean.martin@example.com / password123
- marie.dubois@example.com / password123
- pierre.garcia@example.com / password123
- sophie.lefebvre@example.com / password123

### API Endpoints

#### Authentification
- `POST /api/login_check` - Connexion utilisateur
- `POST /api/token/refresh` - Rafraîchissement token

#### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Création utilisateur
- `GET /api/users/{id}` - Détails utilisateur
- `PUT /api/users/{id}` - Modification utilisateur
- `DELETE /api/users/{id}` - Suppression utilisateur

#### Covoiturages
- `GET /api/covoiturages` - Liste des covoiturages
- `POST /api/covoiturages` - Création covoiturage
- `GET /api/covoiturages/{id}` - Détails covoiturage
- `PUT /api/covoiturages/{id}` - Modification covoiturage
- `DELETE /api/covoiturages/{id}` - Suppression covoiturage
- `POST /api/covoiturages/{id}/reserve` - Réservation

#### Véhicules
- `GET /api/voitures` - Liste des véhicules
- `POST /api/voitures` - Création véhicule
- `GET /api/voitures/{id}` - Détails véhicule
- `PUT /api/voitures/{id}` - Modification véhicule
- `DELETE /api/voitures/{id}` - Suppression véhicule

#### Avis
- `GET /api/avis` - Liste des avis
- `POST /api/avis` - Création avis
- `GET /api/avis/{id}` - Détails avis
- `PUT /api/avis/{id}` - Modification avis
- `DELETE /api/avis/{id}` - Suppression avis

#### Notifications
- `GET /api/notifications` - Liste des notifications
- `GET /api/notifications/unread-count` - Nombre de notifications non lues
- `POST /api/notifications/{id}/read` - Marquer comme lue
- `POST /api/notifications/mark-all-read` - Marquer toutes comme lues
- `DELETE /api/notifications/{id}` - Supprimer notification

#### Statistiques (Admin uniquement)
- `GET /api/statistics` - Toutes les statistiques
- `GET /api/statistics/general` - Statistiques générales
- `GET /api/statistics/users` - Statistiques utilisateurs
- `GET /api/statistics/covoiturages` - Statistiques covoiturages
- `GET /api/statistics/avis` - Statistiques avis
- `GET /api/statistics/notifications` - Statistiques notifications
- `GET /api/statistics/vehicules` - Statistiques véhicules
- `GET /api/statistics/financial` - Statistiques financières

### Interface d'Administration

L'interface d'administration est accessible via :
- URL : `/admin` (après connexion admin)
- Fonctionnalités :
  - Gestion des utilisateurs
  - Gestion des rôles
  - Modération des avis
  - Gestion des véhicules
  - Statistiques détaillées
  - Gestion des notifications

## Structure du Projet

```
EcoRide/
├── backend/                    # Application Symfony
│   ├── src/
│   │   ├── Controller/         # Contrôleurs
│   │   │   ├── Admin/          # Contrôleurs admin
│   │   │   └── Api/            # Contrôleurs API
│   │   ├── Entity/             # Entités Doctrine
│   │   ├── Repository/         # Repositories
│   │   ├── Service/            # Services métier
│   │   ├── Form/               # Formulaires
│   │   └── DataFixtures/       # Fixtures de test
│   ├── config/                 # Configuration
│   ├── migrations/             # Migrations Doctrine
│   └── templates/              # Templates Twig
├── pages/                      # Pages HTML frontend
├── js/                         # JavaScript modules
├── scss/                       # Styles SCSS
├── images/                     # Images statiques
└── README.md                   # Documentation
```

## Sécurité

### Authentification JWT
- Tokens JWT pour l'API
- Refresh tokens automatiques
- Sécurisation des endpoints sensibles

### Autorisations
- Système de rôles (ROLE_ADMIN, ROLE_USER)
- Contrôle d'accès basé sur les rôles
- Validation CSRF pour les formulaires

### Validation des données
- Validation Symfony Validator
- Sanitisation des entrées
- Contrôles de sécurité ORM

## Développement

### Ajout de nouvelles fonctionnalités

1. **Nouvelle entité** :
```bash
php bin/console make:entity NouvelleEntite
```

2. **Nouveau contrôleur** :
```bash
php bin/console make:controller NouveauController
```

3. **Nouvelle route API** :
```bash
# Ajouter dans le contrôleur approprié
#[Route('/api/nouvelle-route', name: 'nouvelle_route', methods: ['GET'])]
```

### Tests
```bash
# Tests unitaires
php bin/phpunit

# Tests fonctionnels
php bin/console doctrine:fixtures:load --env=test
```

### Déploiement

1. **Configuration production** :
```bash
# .env.local pour production
APP_ENV=prod
APP_DEBUG=0
```

2. **Cache et assets** :
```bash
php bin/console cache:clear
php bin/console assets:install
```

## Support et Contribution

### Support
- Documentation : Voir les fichiers README
- Issues : Ouvrir une issue sur le repository
- Contact : support@ecoride.com

### Contribution
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est propriétaire et destiné à un usage éducatif.

## Changelog

### Version 1.0.0
- ✅ Architecture de base Symfony 7
- ✅ Système d'authentification JWT
- ✅ Gestion des utilisateurs et véhicules
- ✅ Système de covoiturage complet
- ✅ Interface d'administration
- ✅ API REST complète
- ✅ Système de notifications
- ✅ Statistiques détaillées
- ✅ Fixtures de données de test
- ✅ Documentation complète

---

**EcoRide** - Une solution complète et moderne pour le covoiturage écologique ! 🌱
