# Documentation de Déploiement - EcoRide

## Plateforme de Covoiturage Écologique

### Version 1.0.0
### Date : Décembre 2024

---

## Table des Matières

1. Prérequis Système
2. Installation Locale
3. Configuration Environnement
4. Déploiement Production
5. Configuration Serveur
6. Optimisations Performance
7. Sécurité
8. Sauvegarde et Restauration
9. Monitoring et Maintenance
10. Troubleshooting

---

## 1. Prérequis Système

### 1.1 Configuration Minimale
- **Serveur Web** : Apache 2.4+ ou Nginx 1.18+
- **PHP** : 8.2 ou supérieur
- **Base de données** : MySQL 8.0+ ou MariaDB 10.4+
- **RAM** : 2 GB minimum (4 GB recommandé)
- **Stockage** : 10 GB minimum
- **Système** : Linux (Ubuntu 20.04+, Debian 11+)

### 1.2 Extensions PHP Requises
```bash
php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl
php8.2-zip php8.2-gd php8.2-mbstring php8.2-intl php8.2-bcmath
```

### 1.3 Outils Supplémentaires
- **Composer** : 2.5+
- **Git** : 2.25+
- **Certbot** : Pour SSL (optionnel)
- **Redis** : Pour le cache (optionnel)

---

## 2. Installation Locale

### 2.1 Clonage du Projet
```bash
git clone https://github.com/votre-repo/ecoride.git
cd ecoride
```

### 2.2 Backend - Installation
```bash
cd backend
composer install --no-dev --optimize-autoloader
```

### 2.3 Configuration Base de Données
```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importer le schéma
mysql -u root -p ecoride < ../database_schema.sql

# Importer les fixtures
mysql -u root -p ecoride < ../database_fixtures.sql
```

### 2.4 Configuration Environnement
```bash
cp .env .env.local
nano .env.local
```

Configuration recommandée pour développement :
```env
APP_ENV=dev
APP_DEBUG=1
APP_SECRET=votre_secret_ici
DATABASE_URL=mysql://user:password@127.0.0.1:3306/ecoride?serverVersion=8.0
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
```

### 2.5 Génération Clés JWT
```bash
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
```

### 2.6 Frontend - Installation
```bash
cd ../
npm install
```

### 2.7 Démarrage des Serveurs
```bash
# Terminal 1 - Backend
cd backend
symfony server:start -d --port=8000

# Terminal 2 - Frontend
npm run dev -- --port=3000
```

---

## 3. Configuration Environnement

### 3.1 Variables d'Environnement
```env
# Environnement
APP_ENV=prod
APP_DEBUG=0
APP_SECRET=votre_secret_production

# Base de données
DATABASE_URL=mysql://ecoride_user:secure_password@db_host:3306/ecoride_prod?serverVersion=8.0

# JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=votre_passphrase_jwt

# Mail
MAILER_DSN=smtp://user:pass@smtp.example.com:587

# Cache (optionnel)
CACHE_DSN=redis://localhost:6379

# Logs
LOG_LEVEL=warning
```

### 3.2 Configuration Symfony
```bash
# Vider le cache
php bin/console cache:clear --env=prod

# Précharger le cache
php bin/console cache:warmup --env=prod

# Installer les assets
php bin/console assets:install --env=prod
```

---

## 4. Déploiement Production

### 4.1 Préparation du Code
```bash
# Récupérer la dernière version
git pull origin main

# Installer les dépendances
composer install --no-dev --optimize-autoloader

# Construire les assets frontend
npm run build
```

### 4.2 Configuration Base de Données
```bash
# Mettre à jour le schéma
php bin/console doctrine:migrations:migrate --env=prod

# Vider le cache
php bin/console cache:clear --env=prod
```

### 4.3 Permissions des Fichiers
```bash
# Permissions pour Symfony
chmod -R 755 var/
chmod -R 755 public/
chmod -R 644 config/jwt/

# Permissions pour les logs
chmod -R 775 var/log/
chmod -R 775 var/cache/

# Propriétaire des fichiers
chown -R www-data:www-data var/
```

---

## 5. Configuration Serveur

### 5.1 Configuration Apache
Créer le fichier `/etc/apache2/sites-available/ecoride.conf` :

```apache
<VirtualHost *:80>
    ServerName ecoride.example.com
    DocumentRoot /var/www/ecoride/public

    <Directory /var/www/ecoride/public>
        AllowOverride All
        Require all granted
        FallbackResource /index.php
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/ecoride_error.log
    CustomLog ${APACHE_LOG_DIR}/ecoride_access.log combined

    # Configuration PHP-FPM
    <FilesMatch \.php$>
        SetHandler proxy:fcgi://127.0.0.1:9000
    </FilesMatch>
</VirtualHost>
```

Activer le site :
```bash
a2ensite ecoride
a2enmod rewrite
a2enmod proxy_fcgi
systemctl reload apache2
```

### 5.2 Configuration Nginx
Créer le fichier `/etc/nginx/sites-available/ecoride` :

```nginx
server {
    listen 80;
    server_name ecoride.example.com;
    root /var/www/ecoride/public;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/index\.php(/|$) {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        internal;
    }

    location ~ \.php$ {
        return 404;
    }

    error_log /var/log/nginx/ecoride_error.log;
    access_log /var/log/nginx/ecoride_access.log;
}
```

Activer le site :
```bash
ln -s /etc/nginx/sites-available/ecoride /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5.3 SSL avec Let's Encrypt
```bash
# Installation Certbot
apt install certbot python3-certbot-apache  # ou nginx

# Génération certificat
certbot --apache -d ecoride.example.com  # ou --nginx
```

---

## 6. Optimisations Performance

### 6.1 Cache Symfony
```bash
# Configuration cache Redis (optionnel)
composer require symfony/redis-messenger

# Configuration dans .env
CACHE_DSN=redis://127.0.0.1:6379/0
```

### 6.2 Optimisation Base de Données
```sql
-- Index supplémentaires
CREATE INDEX idx_covoiturage_date_status ON covoiturage(date_depart, status);
CREATE INDEX idx_utilisateur_email_pseudo ON utilisateur(email, pseudo);
CREATE INDEX idx_avis_auteur_statut ON avis(auteur_id, statut);
```

### 6.3 Optimisation PHP
```ini
# Dans php.ini ou .user.ini
memory_limit = 256M
max_execution_time = 60
opcache.enable = 1
opcache.memory_consumption = 128
opcache.max_accelerated_files = 10000
realpath_cache_size = 4096K
```

### 6.4 Optimisation Frontend
```bash
# Minification CSS/JS
npm install --save-dev css-minify js-minify

# Compression Gzip
# Ajouter dans .htaccess ou configuration serveur
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

## 7. Sécurité

### 7.1 Configuration PHP
```ini
# Sécurité PHP
expose_php = Off
allow_url_fopen = Off
allow_url_include = Off
disable_functions = exec,shell_exec,system,passthru
```

### 7.2 Pare-feu
```bash
# UFW (Ubuntu/Debian)
ufw allow 'Apache Full'
ufw allow 'OpenSSH'
ufw enable

# Ou iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

### 7.3 Sécurité Base de Données
```sql
-- Création utilisateur dédié
CREATE USER 'ecoride_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ecoride_prod.* TO 'ecoride_user'@'localhost';
FLUSH PRIVILEGES;

-- Supprimer utilisateur par défaut
DROP USER 'root'@'localhost';
```

### 7.4 Sécurité Application
```bash
# Changer le propriétaire des fichiers sensibles
chown root:root config/jwt/private.pem
chmod 600 config/jwt/private.pem

# Masquer les fichiers sensibles
# Ajouter dans .htaccess
<Files "private.pem">
    Order Allow,Deny
    Deny from all
</Files>
```

---

## 8. Sauvegarde et Restauration

### 8.1 Sauvegarde Automatisée
Script de sauvegarde quotidien :

```bash
#!/bin/bash
# /usr/local/bin/backup-ecoride.sh

BACKUP_DIR="/var/backups/ecoride"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde base de données
mysqldump -u ecoride_user -p'secure_password' ecoride_prod > $BACKUP_DIR/db_$DATE.sql

# Sauvegarde fichiers
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/ecoride --exclude=/var/www/ecoride/var/cache --exclude=/var/www/ecoride/var/log

# Nettoyage des anciennes sauvegardes (garder 7 jours)
find $BACKUP_DIR -type f -mtime +7 -delete

# Log
echo "Sauvegarde terminée: $DATE" >> $BACKUP_DIR/backup.log
```

### 8.2 Restauration
```bash
# Restaurer la base de données
mysql -u ecoride_user -p'secure_password' ecoride_prod < /var/backups/ecoride/db_20241201_120000.sql

# Restaurer les fichiers
tar -xzf /var/backups/ecoride/files_20241201_120000.tar.gz -C /
```

### 8.3 Planification Cron
```bash
# Éditer la crontab
crontab -e

# Ajouter (sauvegarde quotidienne à 2h)
0 2 * * * /usr/local/bin/backup-ecoride.sh
```

---

## 9. Monitoring et Maintenance

### 9.1 Logs Symfony
```bash
# Consulter les logs
tail -f var/log/prod.log

# Rotation des logs
php bin/console log:clear --env=prod
```

### 9.2 Monitoring Système
```bash
# Installation Munin ou Zabbix
apt install munin-node

# Monitoring personnalisé
#!/bin/bash
# Vérifier les services
systemctl is-active --quiet apache2 && echo "Apache OK" || echo "Apache KO"
systemctl is-active --quiet mysql && echo "MySQL OK" || echo "MySQL KO"
```

### 9.3 Métriques Application
```bash
# Statistiques Symfony
php bin/console debug:container --env=prod | grep -E "(Service|Parameter)" | wc -l

# Métriques base de données
php bin/console doctrine:query:dql "SELECT COUNT(u) FROM App\Entity\Utilisateur u"
```

### 9.4 Maintenance Planifiée
```bash
# Nettoyage quotidien
php bin/console cache:clear --env=prod
php bin/console doctrine:query:sql "DELETE FROM notification WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"

# Optimisation base de données
php bin/console doctrine:query:sql "OPTIMIZE TABLE utilisateur, covoiturage, avis"
```

---

## 10. Troubleshooting

### 10.1 Problèmes Courants

#### Erreur 500 - Internal Server Error
```bash
# Vérifier les logs
tail -f var/log/prod.log

# Vérifier les permissions
ls -la var/cache var/log

# Redémarrer les services
systemctl restart apache2 php8.2-fpm
```

#### Base de données inaccessible
```bash
# Vérifier la connexion
php bin/console doctrine:query:sql "SELECT 1" --env=prod

# Vérifier les credentials
nano .env.local
```

#### Frontend ne se charge pas
```bash
# Vérifier le serveur de développement
ps aux | grep "live-server\|node"

# Vérifier les ports
netstat -tlnp | grep :3000
```

#### JWT ne fonctionne pas
```bash
# Vérifier les clés
ls -la config/jwt/

# Régénérer les clés
openssl genpkey -out config/jwt/private.pem -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
```

### 10.2 Outils de Diagnostic
```bash
# Symfony Check
php bin/console debug:config framework --env=prod

# Vérification sécurité
php bin/console security:check --env=prod

# Métriques performance
php bin/console debug:performance
```

### 10.3 Support
- **Logs** : Consulter `var/log/prod.log`
- **Debug** : Activer temporairement `APP_DEBUG=1`
- **Community** : Forum Symfony, Stack Overflow
- **Contact** : support@ecoride.com

---

## Conclusion

Ce guide couvre l'ensemble du processus de déploiement d'EcoRide en production. Suivez attentivement chaque étape pour garantir une installation sécurisée et performante.

**Pour plus d'informations :**
- Documentation officielle Symfony
- Guide de sécurité OWASP
- Best practices PHP

---

**EcoRide - Déploiement maîtrisé !** 🚀
