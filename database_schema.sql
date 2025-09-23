-- EcoRide Database Schema
-- Version 1.0.0
-- Date: Décembre 2024

-- Create database
CREATE DATABASE IF NOT EXISTS ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecoride;

-- Users table
CREATE TABLE utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NULL,
    adresse VARCHAR(255) NULL,
    date_naissance DATE NULL,
    photo VARCHAR(255) NULL,
    pseudo VARCHAR(50) NOT NULL UNIQUE,
    credits INT DEFAULT 20 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

-- User roles junction table
CREATE TABLE utilisateur_role (
    utilisateur_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (utilisateur_id, role_id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

-- Car brands table
CREATE TABLE marque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

-- Vehicles table
CREATE TABLE voiture (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modele VARCHAR(50) NOT NULL,
    immatriculation VARCHAR(50) NULL,
    energie VARCHAR(50) NULL,
    couleur VARCHAR(50) NOT NULL,
    date_premiere_immatriculation DATE NULL,
    utilisateur_id INT NOT NULL,
    marque_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (marque_id) REFERENCES marque(id) ON DELETE CASCADE
);

-- Carpool trips table
CREATE TABLE covoiturage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_depart DATE NOT NULL,
    heure_depart TIME NOT NULL,
    lieu_depart VARCHAR(255) NOT NULL,
    date_arrivee DATE NOT NULL,
    heure_arrivee TIME NOT NULL,
    lieu_arrivee VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    nb_place INT NOT NULL,
    prix_personne DECIMAL(10,2) NOT NULL,
    voiture_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (voiture_id) REFERENCES voiture(id) ON DELETE CASCADE
);

-- Carpool passengers junction table
CREATE TABLE covoiturage_passenger (
    covoiturage_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    PRIMARY KEY (covoiturage_id, utilisateur_id),
    FOREIGN KEY (covoiturage_id) REFERENCES covoiturage(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commentaire TEXT NULL,
    note INT NOT NULL CHECK (note >= 1 AND note <= 5),
    statut VARCHAR(50) NOT NULL DEFAULT 'pending',
    auteur_id INT NULL,
    covoiturage_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auteur_id) REFERENCES utilisateur(id) ON DELETE SET NULL,
    FOREIGN KEY (covoiturage_id) REFERENCES covoiturage(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'unread',
    destinataire_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destinataire_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Configuration table
CREATE TABLE configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cle VARCHAR(100) NOT NULL UNIQUE,
    valeur TEXT NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Parameters table
CREATE TABLE parametre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cle VARCHAR(100) NOT NULL UNIQUE,
    valeur TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO role (libelle) VALUES
('ROLE_USER'),
('ROLE_ADMIN'),
('ROLE_EMPLOYEE');

-- Insert default car brands
INSERT INTO marque (libelle) VALUES
('Renault'),
('Peugeot'),
('Citroën'),
('Volkswagen'),
('BMW'),
('Mercedes'),
('Audi'),
('Ford'),
('Toyota'),
('Nissan'),
('Tesla'),
('Autre');

-- Insert default configuration
INSERT INTO configuration (cle, valeur, description) VALUES
('SITE_NAME', 'EcoRide', 'Nom du site'),
('SITE_DESCRIPTION', 'Plateforme de covoiturage écologique', 'Description du site'),
('CONTACT_EMAIL', 'contact@ecoride.com', 'Email de contact'),
('CREDITS_INSCRIPTION', '20', 'Crédits offerts à l\'inscription'),
('COMMISSION_PLATEFORME', '2', 'Crédits prélevés par la plateforme par réservation');

-- Insert default parameters
INSERT INTO parametre (cle, valeur, type) VALUES
('MAINTENANCE_MODE', 'false', 'boolean'),
('MAX_COVOITURAGES_PER_DAY', '5', 'integer'),
('MIN_AGE_USER', '18', 'integer'),
('MAX_PASSENGERS_PER_TRIP', '8', 'integer');

-- Create indexes for better performance
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_pseudo ON utilisateur(pseudo);
CREATE INDEX idx_covoiturage_date_depart ON covoiturage(date_depart);
CREATE INDEX idx_covoiturage_status ON covoiturage(status);
CREATE INDEX idx_covoiturage_lieu_depart ON covoiturage(lieu_depart);
CREATE INDEX idx_covoiturage_lieu_arrivee ON covoiturage(lieu_arrivee);
CREATE INDEX idx_avis_statut ON avis(statut);
CREATE INDEX idx_notification_destinataire ON notification(destinataire_id);
CREATE INDEX idx_notification_statut ON notification(statut);

-- Create views for common queries
CREATE VIEW v_covoiturages_disponibles AS
SELECT
    c.*,
    v.modele,
    v.couleur,
    v.energie,
    m.libelle as marque_libelle,
    u.pseudo as chauffeur_pseudo,
    u.photo as chauffeur_photo,
    (c.nb_place - COALESCE(p.passenger_count, 0)) as places_restantes
FROM covoiturage c
JOIN voiture v ON c.voiture_id = v.id
JOIN marque m ON v.marque_id = m.id
JOIN utilisateur u ON v.utilisateur_id = u.id
LEFT JOIN (
    SELECT covoiturage_id, COUNT(*) as passenger_count
    FROM covoiturage_passenger
    GROUP BY covoiturage_id
) p ON c.id = p.covoiturage_id
WHERE c.status = 'planned'
AND c.date_depart >= CURDATE()
AND (c.nb_place - COALESCE(p.passenger_count, 0)) > 0;

CREATE VIEW v_statistiques_generales AS
SELECT
    (SELECT COUNT(*) FROM utilisateur WHERE DATE(created_at) = CURDATE()) as nouveaux_utilisateurs_aujourdhui,
    (SELECT COUNT(*) FROM covoiturage WHERE DATE(created_at) = CURDATE()) as nouveaux_covoiturages_aujourdhui,
    (SELECT COUNT(*) FROM covoiturage WHERE status = 'completed') as covoiturages_termines,
    (SELECT COUNT(*) FROM avis WHERE statut = 'approved') as avis_approuves,
    (SELECT SUM(credits) FROM utilisateur) as credits_total,
    (SELECT COUNT(*) FROM utilisateur) as total_utilisateurs,
    (SELECT COUNT(*) FROM covoiturage) as total_covoiturages;
