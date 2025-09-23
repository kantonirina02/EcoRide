# Documentation Technique - EcoRide

## Plateforme de Covoiturage Écologique

### Version 1.0.0
### Date : Décembre 2024

---

## Table des Matières

1. Architecture Générale
2. Configuration Environnement
3. Modèle Conceptuel de Données
4. Diagrammes UML
5. Technologies Utilisées
6. Structure du Projet
7. API REST
8. Sécurité
9. Déploiement
10. Tests et Maintenance

---

## 1. Architecture Générale

### 1.1 Vue d'ensemble
EcoRide suit une architecture **MVC (Modèle-Vue-Contrôleur)** avec séparation claire des responsabilités :

- **Frontend** : Interface utilisateur en HTML5/CSS3/JavaScript
- **Backend** : API REST développée avec Symfony 7
- **Base de données** : MySQL avec Doctrine ORM

### 1.2 Flux de Données
```
Frontend (HTML/JS) → API REST (Symfony) → Base de données (MySQL)
                      ↑
                Authentification JWT
```

---

## 2. Configuration Environnement

### 2.1 Prérequis Système
- **PHP** : >= 8.2
- **MySQL** : >= 8.0
- **Composer** : Pour la gestion des dépendances
- **Node.js** : >= 16.0 (pour le frontend)
- **OpenSSL** : Pour les clés JWT

### 2.2 Variables d'Environnement
```env
# .env.local
APP_ENV=dev
APP_DEBUG=1
DATABASE_URL=mysql://user:password@127.0.0.1:3306/ecoride
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
```

### 2.3 Installation
```bash
# Backend
cd backend
composer install
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load

# Frontend
npm install
npm run dev
```

---

## 3. Modèle Conceptuel de Données

### 3.1 Entités Principales

#### Utilisateur
- **id** : Integer (Primary Key)
- **nom** : String (50)
- **prenom** : String (50)
- **email** : String (255, unique)
- **password** : String (255)
- **pseudo** : String (50, unique)
- **telephone** : String (20, nullable)
- **credits** : Integer (default: 20)
- **roles** : ManyToMany avec Role

#### Covoiturage
- **id** : Integer (Primary Key)
- **dateDepart** : Date
- **heureDepart** : Time
- **lieuDepart** : String (255)
- **dateArrivee** : Date
- **heureArrivee** : Time
- **lieuArrivee** : String (255)
- **status** : String (50)
- **nbPlace** : Integer
- **prixPersonne** : Float
- **voiture** : ManyToOne avec Voiture
- **passengers** : ManyToMany avec Utilisateur

#### Voiture
- **id** : Integer (Primary Key)
- **modele** : String (50)
- **immatriculation** : String (50, nullable)
- **energie** : String (50, nullable)
- **couleur** : String (50)
- **utilisateur** : ManyToOne avec Utilisateur
- **marque** : ManyToOne avec Marque

#### Avis
- **id** : Integer (Primary Key)
- **commentaire** : Text (nullable)
- **note** : Integer (1-5)
- **auteur** : ManyToOne avec Utilisateur
- **covoiturage** : ManyToOne avec Covoiturage
- **statut** : String (50)

### 3.2 Relations
```
Utilisateur ─┬─ Voiture ─┬─ Covoiturage ─┬─ Avis
             │           │               │
             └─ Marque   └─ Utilisateur  └─ Utilisateur
                        (passagers)
```

---

## 4. Diagrammes UML

### 4.1 Diagramme de Classes

#### Classe Utilisateur
```php
class Utilisateur {
    - id: int
    - nom: string
    - prenom: string
    - email: string
    - password: string
    - pseudo: string
    - credits: int
    + getRoles(): array
    + addCredits(amount: int): void
    + removeCredits(amount: int): bool
}
```

#### Classe Covoiturage
```php
class Covoiturage {
    - id: int
    - dateDepart: DateTime
    - lieuDepart: string
    - status: string
    - nbPlace: int
    - prixPersonne: float
    + addPassenger(passenger: Utilisateur): void
    + removePassenger(passenger: Utilisateur): void
}
```

### 4.2 Diagramme de Séquence - Réservation

```
Utilisateur → Frontend : Rechercher covoiturage
Frontend → API : GET /api/covoiturages
API → Base : Requête SQL
Base → API : Résultats
API → Frontend : JSON response
Frontend → Utilisateur : Affichage résultats

Utilisateur → Frontend : Réserver
Frontend → API : POST /api/covoiturages/{id}/reserve
API → Service : Vérifier crédits
API → Base : Mettre à jour réservation
API → NotificationService : Envoyer notification
API → Frontend : Confirmation
```

---

## 5. Technologies Utilisées

### 5.1 Backend
- **Framework** : Symfony 7.2
- **ORM** : Doctrine 3.3
- **Authentification** : LexikJWTAuthenticationBundle
- **Validation** : Symfony Validator
- **Sérialisation** : Symfony Serializer
- **Migrations** : Doctrine Migrations

### 5.2 Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Bootstrap 5.3.3
- **JavaScript** : Vanilla JS (modules ES6)
- **Build** : Live Server pour développement

### 5.3 Base de Données
- **SGBD** : MySQL 8.0
- **Driver** : PDO MySQL
- **Pool de connexions** : Configuré via Doctrine

### 5.4 Sécurité
- **JWT** : Authentification stateless
- **CSRF** : Protection des formulaires
- **HTTPS** : Recommandé en production
- **Validation** : Sanitisation des entrées

---

## 6. Structure du Projet

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

---

## 7. API REST

### 7.1 Endpoints Principaux

#### Authentification
```
POST /api/login_check
- Body: { "username": "email", "password": "password" }
- Response: { "token": "jwt_token" }

POST /api/token/refresh
- Headers: Authorization: Bearer {refresh_token}
- Response: { "token": "new_jwt_token" }
```

#### Utilisateurs
```
GET /api/users              # Liste utilisateurs
POST /api/users             # Créer utilisateur
GET /api/users/{id}         # Détails utilisateur
PUT /api/users/{id}         # Modifier utilisateur
DELETE /api/users/{id}      # Supprimer utilisateur
```

#### Covoiturages
```
GET /api/covoiturages       # Liste covoiturages
POST /api/covoiturages      # Créer covoiturage
GET /api/covoiturages/{id}  # Détails covoiturage
PUT /api/covoiturages/{id}  # Modifier covoiturage
DELETE /api/covoiturages/{id} # Supprimer covoiturage
POST /api/covoiturages/{id}/reserve # Réserver
```

#### Véhicules
```
GET /api/voitures           # Liste véhicules
POST /api/voitures          # Créer véhicule
GET /api/voitures/{id}      # Détails véhicule
PUT /api/voitures/{id}      # Modifier véhicule
DELETE /api/voitures/{id}   # Supprimer véhicule
```

### 7.2 Codes de Statut HTTP
- **200** : Succès
- **201** : Créé
- **400** : Requête invalide
- **401** : Non autorisé
- **403** : Interdit
- **404** : Non trouvé
- **500** : Erreur serveur

---

## 8. Sécurité

### 8.1 Authentification JWT
- **Algorithme** : RS256
- **Durée de vie** : 1 heure (configurable)
- **Refresh token** : 30 jours
- **Stockage** : HTTP-only cookies

### 8.2 Autorisations
- **ROLE_USER** : Utilisateur standard
- **ROLE_ADMIN** : Administrateur
- **ROLE_EMPLOYEE** : Employé (modération)

### 8.3 Validation des Données
```php
// Exemple de validation Symfony
#[Assert\NotBlank]
#[Assert\Email]
private ?string $email = null;

#[Assert\Length(min: 8)]
#[Assert\Regex(pattern: "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/")]
private ?string $password = null;
```

### 8.4 Protection CSRF
- Tokens CSRF pour tous les formulaires
- Vérification automatique par Symfony

---

## 9. Déploiement

### 9.1 Environnement de Développement
```bash
# Installation locale
git clone <repository>
cd EcoRide/backend
composer install
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load

# Démarrage
symfony server:start
```

### 9.2 Environnement de Production
```bash
# Configuration production
APP_ENV=prod
APP_DEBUG=0
DATABASE_URL=mysql://prod_user:prod_pass@prod_host:3306/ecoride_prod

# Optimisations
php bin/console cache:clear --env=prod
php bin/console assets:install --env=prod
```

### 9.3 Serveur Recommandé
- **Apache** : Configuration .htaccess incluse
- **Nginx** : Configuration fournie
- **SSL** : Certificat obligatoire
- **Cache** : Redis recommandé

---

## 10. Tests et Maintenance

### 10.1 Tests Unitaires
```bash
# Tests PHPUnit
php bin/phpunit tests/

# Tests spécifiques
php bin/phpunit tests/Service/CovoiturageServiceTest.php
```

### 10.2 Tests d'Intégration
```bash
# Tests avec fixtures
php bin/console doctrine:fixtures:load --env=test
php bin/phpunit tests/Controller/
```

### 10.3 Métriques de Code
- **Couverture** : PHPUnit avec Xdebug
- **Qualité** : PHPStan, PHPCS
- **Performance** : Blackfire.io

### 10.4 Maintenance
- **Migrations** : Appliquer régulièrement
- **Sauvegardes** : Base de données quotidienne
- **Logs** : Rotation automatique
- **Monitoring** : Uptime et performance

---

## Conclusion

EcoRide est une application robuste et scalable, conçue selon les meilleures pratiques du développement web moderne. L'architecture modulaire facilite la maintenance et l'évolution future.

**Pour plus d'informations :**
- Documentation API : /api/doc
- Support technique : support@ecoride.com
- Repository : [GitHub Link]

---

**EcoRide - Technologie au service de l'écologie !** 🌱
