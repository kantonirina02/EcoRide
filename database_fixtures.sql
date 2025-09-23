-- EcoRide Database Fixtures
-- Version 1.0.0
-- Date: Décembre 2024

USE ecoride;

-- Insert test users
INSERT INTO utilisateur (nom, prenom, email, password, pseudo, telephone, credits) VALUES
('Martin', 'Jean', 'jean.martin@example.com', '$2y$13$8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J', 'jeanm', '06.12.34.56.78', 25),
('Dubois', 'Marie', 'marie.dubois@example.com', '$2y$13$8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J', 'maried', '06.98.76.54.32', 30),
('Garcia', 'Pierre', 'pierre.garcia@example.com', '$2y$13$8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J', 'pierreg', '06.11.22.33.44', 15),
('Lefebvre', 'Sophie', 'sophie.lefebvre@example.com', '$2y$13$8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J', 'sophiel', '06.55.66.77.88', 40),
('Admin', 'EcoRide', 'admin@ecoride.com', '$2y$13$8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J', 'admin', '01.23.45.67.89', 100);

-- Assign admin role
INSERT INTO utilisateur_role (utilisateur_id, role_id)
SELECT u.id, r.id
FROM utilisateur u, role r
WHERE u.pseudo = 'admin' AND r.libelle = 'ROLE_ADMIN';

-- Assign user roles
INSERT INTO utilisateur_role (utilisateur_id, role_id)
SELECT u.id, r.id
FROM utilisateur u, role r
WHERE r.libelle = 'ROLE_USER';

-- Insert test vehicles
INSERT INTO voiture (modele, immatriculation, energie, couleur, utilisateur_id, marque_id) VALUES
('Clio', 'AB-123-CD', 'essence', 'bleu', 1, 1), -- Renault
('208', 'EF-456-GH', 'diesel', 'rouge', 2, 2), -- Peugeot
('Golf', 'IJ-789-KL', 'essence', 'noir', 3, 4), -- Volkswagen
('Model 3', 'MN-012-OP', 'electrique', 'blanc', 4, 11), -- Tesla
('C3', 'QR-345-ST', 'essence', 'gris', 1, 3); -- Citroën

-- Insert test carpools
INSERT INTO covoiturage (date_depart, heure_depart, lieu_depart, date_arrivee, heure_arrivee, lieu_arrivee, status, nb_place, prix_personne, voiture_id) VALUES
('2024-12-20', '08:00:00', 'Paris', '2024-12-20', '10:00:00', 'Lyon', 'planned', 3, 25.00, 1),
('2024-12-21', '14:30:00', 'Marseille', '2024-12-21', '17:00:00', 'Nice', 'planned', 2, 30.00, 2),
('2024-12-22', '09:15:00', 'Toulouse', '2024-12-22', '12:30:00', 'Bordeaux', 'planned', 4, 20.00, 3),
('2024-12-23', '16:45:00', 'Lille', '2024-12-23', '19:00:00', 'Bruxelles', 'planned', 2, 35.00, 4),
('2024-12-24', '07:30:00', 'Nantes', '2024-12-24', '11:00:00', 'Rennes', 'planned', 3, 15.00, 5);

-- Insert test passengers for carpools
INSERT INTO covoiturage_passenger (covoiturage_id, utilisateur_id) VALUES
(1, 2), -- Marie joins Jean's trip
(2, 3), -- Pierre joins Marie's trip
(3, 4), -- Sophie joins Pierre's trip
(4, 1); -- Jean joins Sophie's trip

-- Insert test reviews
INSERT INTO avis (commentaire, note, statut, auteur_id, covoiturage_id) VALUES
('Excellent conducteur, très ponctuel !', 5, 'approved', 2, 1),
('Trajet agréable, bonne conversation', 4, 'approved', 3, 2),
('Voiture propre et confortable', 5, 'approved', 4, 3),
('Conduite souple et sécurisante', 4, 'pending', 1, 4),
('Très bonne expérience globale', 5, 'approved', 2, 3);

-- Insert test notifications
INSERT INTO notification (titre, message, type, statut, destinataire_id) VALUES
('Réservation confirmée', 'Votre réservation pour le trajet Paris-Lyon a été confirmée.', 'reservation', 'unread', 2),
('Nouveau covoiturage', 'Un nouveau covoiturage correspondant à vos critères a été publié.', 'covoiturage', 'unread', 3),
('Crédits reçus', 'Vous avez reçu 25 crédits pour votre dernier covoiturage.', 'credits', 'read', 1),
('Avis reçu', 'Vous avez reçu un nouvel avis sur votre profil.', 'avis', 'unread', 4),
('Maintenance programmée', 'Une maintenance est prévue ce soir de 22h à 23h.', 'system', 'read', 1);

-- Insert additional test data
INSERT INTO utilisateur (nom, prenom, email, password, pseudo, credits) VALUES
('Bernard', 'Lucie', 'lucie.bernard@example.com', '$2y$13$8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J', 'luciel', 18),
('Moreau', 'Thomas', 'thomas.moreau@example.com', '$2y$13$8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J', 'thomasm', 22),
('Simon', 'Emma', 'emma.simon@example.com', '$2y$13$8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J8K1v5J5J', 'emmas', 35);

-- Insert more vehicles
INSERT INTO voiture (modele, immatriculation, energie, couleur, utilisateur_id, marque_id) VALUES
('Megane', 'UV-678-WX', 'electrique', 'bleu', 6, 1), -- Renault
('3008', 'YZ-901-AB', 'hybride', 'gris', 7, 2), -- Peugeot
('ID.3', 'CD-234-EF', 'electrique', 'blanc', 8, 4); -- Volkswagen

-- Insert more carpools
INSERT INTO covoiturage (date_depart, heure_depart, lieu_depart, date_arrivee, heure_arrivee, lieu_arrivee, status, nb_place, prix_personne, voiture_id) VALUES
('2024-12-25', '10:00:00', 'Strasbourg', '2024-12-25', '12:30:00', 'Mulhouse', 'planned', 3, 18.00, 6),
('2024-12-26', '15:20:00', 'Grenoble', '2024-12-26', '18:00:00', 'Chambéry', 'planned', 2, 22.00, 7),
('2024-12-27', '08:45:00', 'Montpellier', '2024-12-27', '11:15:00', 'Nîmes', 'planned', 4, 12.00, 8);

-- Insert more passengers
INSERT INTO covoiturage_passenger (covoiturage_id, utilisateur_id) VALUES
(6, 7), (7, 8), (8, 6);

-- Insert more reviews
INSERT INTO avis (commentaire, note, statut, auteur_id, covoiturage_id) VALUES
('Parfait, je recommande !', 5, 'approved', 7, 6),
('Ponctualité irréprochable', 5, 'approved', 8, 7),
('Voiture électrique, écologique et silencieuse', 5, 'approved', 6, 8);

-- Insert more notifications
INSERT INTO notification (titre, message, type, statut, destinataire_id) VALUES
('Bienvenue sur EcoRide !', 'Merci de vous être inscrit. Découvrez toutes nos fonctionnalités.', 'welcome', 'read', 6),
('Rappel : covoiturage demain', 'N\'oubliez pas votre covoiturage prévu demain à 10h.', 'reminder', 'unread', 7),
('Crédits insuffisants', 'Vous n\'avez pas assez de crédits pour réserver ce covoiturage.', 'warning', 'read', 8),
('Nouveau message', 'Vous avez reçu un message privé d\'un autre utilisateur.', 'message', 'unread', 1),
('Mise à jour disponible', 'Une nouvelle version de l\'application est disponible.', 'system', 'read', 2);
