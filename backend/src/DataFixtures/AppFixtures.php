<?php

namespace App\DataFixtures;

use App\Entity\Role;
use App\Entity\Utilisateur;
use App\Entity\Marque;
use App\Entity\Voiture;
use App\Entity\Covoiturage;
use App\Entity\Avis;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Création des rôles
        $roleAdmin = new Role();
        $roleAdmin->setLibelle('ROLE_ADMIN');
        $manager->persist($roleAdmin);

        $roleUser = new Role();
        $roleUser->setLibelle('ROLE_USER');
        $manager->persist($roleUser);

        // Création des marques
        $marques = [
            'Renault',
            'Peugeot',
            'Citroën',
            'Volkswagen',
            'Toyota',
            'Ford',
            'BMW',
            'Mercedes',
            'Audi',
            'Fiat'
        ];

        $marqueEntities = [];
        foreach ($marques as $marqueLibelle) {
            $marque = new Marque();
            $marque->setLibelle($marqueLibelle);
            $manager->persist($marque);
            $marqueEntities[] = $marque;
        }

        // Création des utilisateurs
        $utilisateurs = [
            [
                'nom' => 'Martin',
                'prenom' => 'Jean',
                'email' => 'jean.martin@example.com',
                'pseudo' => 'jeanm',
                'password' => 'password123',
                'telephone' => '06.12.34.56.78',
                'adresse' => '123 Rue de Paris, 75001 Paris',
                'credits' => 50
            ],
            [
                'nom' => 'Dubois',
                'prenom' => 'Marie',
                'email' => 'marie.dubois@example.com',
                'pseudo' => 'maried',
                'password' => 'password123',
                'telephone' => '06.98.76.54.32',
                'adresse' => '456 Avenue des Champs, 69000 Lyon',
                'credits' => 30
            ],
            [
                'nom' => 'Garcia',
                'prenom' => 'Pierre',
                'email' => 'pierre.garcia@example.com',
                'pseudo' => 'pierreg',
                'password' => 'password123',
                'telephone' => '06.11.22.33.44',
                'adresse' => '789 Boulevard Saint-Michel, 33000 Bordeaux',
                'credits' => 75
            ],
            [
                'nom' => 'Lefebvre',
                'prenom' => 'Sophie',
                'email' => 'sophie.lefebvre@example.com',
                'pseudo' => 'sophiel',
                'password' => 'password123',
                'telephone' => '06.55.66.77.88',
                'adresse' => '321 Place de la République, 13000 Marseille',
                'credits' => 40
            ],
            [
                'nom' => 'Admin',
                'prenom' => 'System',
                'email' => 'admin@ecoride.com',
                'pseudo' => 'admin',
                'password' => 'admin123',
                'telephone' => '01.23.45.67.89',
                'adresse' => '1 Place de l\'Administration, 75000 Paris',
                'credits' => 100
            ]
        ];

        $utilisateurEntities = [];
        foreach ($utilisateurs as $userData) {
            $utilisateur = new Utilisateur();
            $utilisateur->setNom($userData['nom']);
            $utilisateur->setPrenom($userData['prenom']);
            $utilisateur->setEmail($userData['email']);
            $utilisateur->setPseudo($userData['pseudo']);
            $utilisateur->setPassword($this->passwordHasher->hashPassword($utilisateur, $userData['password']));
            $utilisateur->setTelephone($userData['telephone']);
            $utilisateur->setAdresse($userData['adresse']);
            $utilisateur->setCredits($userData['credits']);

            // Assigner les rôles
            if ($userData['email'] === 'admin@ecoride.com') {
                $utilisateur->addRole($roleAdmin);
            }
            $utilisateur->addRole($roleUser);

            $manager->persist($utilisateur);
            $utilisateurEntities[] = $utilisateur;
        }

        // Création des voitures
        $voitures = [
            [
                'utilisateur' => $utilisateurEntities[0],
                'marque' => $marqueEntities[0],
                'modele' => 'Clio',
                'immatriculation' => 'AB-123-CD',
                'couleur' => 'Bleu',
                'energie' => 'Essence'
            ],
            [
                'utilisateur' => $utilisateurEntities[0],
                'marque' => $marqueEntities[1],
                'modele' => '308',
                'immatriculation' => 'EF-456-GH',
                'couleur' => 'Noir',
                'energie' => 'Diesel'
            ],
            [
                'utilisateur' => $utilisateurEntities[1],
                'marque' => $marqueEntities[2],
                'modele' => 'C3',
                'immatriculation' => 'IJ-789-KL',
                'couleur' => 'Rouge',
                'energie' => 'Essence'
            ],
            [
                'utilisateur' => $utilisateurEntities[2],
                'marque' => $marqueEntities[3],
                'modele' => 'Golf',
                'immatriculation' => 'MN-012-OP',
                'couleur' => 'Gris',
                'energie' => 'Diesel'
            ],
            [
                'utilisateur' => $utilisateurEntities[3],
                'marque' => $marqueEntities[4],
                'modele' => 'Yaris',
                'immatriculation' => 'QR-345-ST',
                'couleur' => 'Blanc',
                'energie' => 'Hybride'
            ]
        ];

        $voitureEntities = [];
        foreach ($voitures as $voitureData) {
            $voiture = new Voiture();
            $voiture->setUtilisateur($voitureData['utilisateur']);
            $voiture->setMarque($voitureData['marque']);
            $voiture->setModele($voitureData['modele']);
            $voiture->setImmatriculation($voitureData['immatriculation']);
            $voiture->setCouleur($voitureData['couleur']);
            $voiture->setEnergie($voitureData['energie']);

            $manager->persist($voiture);
            $voitureEntities[] = $voiture;
        }

        // Création des covoiturages
        $covoiturages = [
            [
                'voiture' => $voitureEntities[0],
                'dateDepart' => '2024-02-15 08:00:00',
                'dateArrivee' => '2024-02-15 10:30:00',
                'lieuDepart' => 'Paris',
                'lieuArrivee' => 'Lyon',
                'nbPlace' => 3,
                'prixPersonne' => 25.0,
                'status' => 'disponible'
            ],
            [
                'voiture' => $voitureEntities[1],
                'dateDepart' => '2024-02-16 14:00:00',
                'dateArrivee' => '2024-02-16 17:00:00',
                'lieuDepart' => 'Lyon',
                'lieuArrivee' => 'Marseille',
                'nbPlace' => 4,
                'prixPersonne' => 30.0,
                'status' => 'disponible'
            ],
            [
                'voiture' => $voitureEntities[2],
                'dateDepart' => '2024-02-17 09:00:00',
                'dateArrivee' => '2024-02-17 12:00:00',
                'lieuDepart' => 'Marseille',
                'lieuArrivee' => 'Nice',
                'nbPlace' => 2,
                'prixPersonne' => 35.0,
                'status' => 'disponible'
            ],
            [
                'voiture' => $voitureEntities[3],
                'dateDepart' => '2024-02-18 10:00:00',
                'dateArrivee' => '2024-02-18 14:00:00',
                'lieuDepart' => 'Bordeaux',
                'lieuArrivee' => 'Toulouse',
                'nbPlace' => 3,
                'prixPersonne' => 20.0,
                'status' => 'disponible'
            ],
            [
                'voiture' => $voitureEntities[4],
                'dateDepart' => '2024-02-19 16:00:00',
                'dateArrivee' => '2024-02-19 19:00:00',
                'lieuDepart' => 'Toulouse',
                'lieuArrivee' => 'Montpellier',
                'nbPlace' => 4,
                'prixPersonne' => 28.0,
                'status' => 'disponible'
            ]
        ];

        $covoiturageEntities = [];
        foreach ($covoiturages as $covoiturageData) {
            $covoiturage = new Covoiturage();
            $covoiturage->setVoiture($covoiturageData['voiture']);
            $covoiturage->setDateDepart(new \DateTime($covoiturageData['dateDepart']));
            $covoiturage->setHeureDepart(new \DateTime($covoiturageData['dateDepart']));
            $covoiturage->setDateArrivee(new \DateTime($covoiturageData['dateArrivee']));
            $covoiturage->setHeureArrivee(new \DateTime($covoiturageData['dateArrivee']));
            $covoiturage->setLieuDepart($covoiturageData['lieuDepart']);
            $covoiturage->setLieuArrivee($covoiturageData['lieuArrivee']);
            $covoiturage->setNbPlace($covoiturageData['nbPlace']);
            $covoiturage->setPrixPersonne($covoiturageData['prixPersonne']);
            $covoiturage->setStatus($covoiturageData['status']);

            $manager->persist($covoiturage);
            $covoiturageEntities[] = $covoiturage;
        }

        // Création des avis
        $avisData = [
            [
                'covoiturage' => $covoiturageEntities[0],
                'auteur' => $utilisateurEntities[1],
                'note' => 5,
                'commentaire' => 'Excellent trajet, conducteur très sympathique et ponctuel !',
                'statut' => 'approuvé'
            ],
            [
                'covoiturage' => $covoiturageEntities[0],
                'auteur' => $utilisateurEntities[3],
                'note' => 4,
                'commentaire' => 'Bon covoiturage, voiture confortable.',
                'statut' => 'approuvé'
            ],
            [
                'covoiturage' => $covoiturageEntities[1],
                'auteur' => $utilisateurEntities[2],
                'note' => 5,
                'commentaire' => 'Parfait ! Je recommande vivement.',
                'statut' => 'approuvé'
            ],
            [
                'covoiturage' => $covoiturageEntities[2],
                'auteur' => $utilisateurEntities[0],
                'note' => 4,
                'commentaire' => 'Très bien, malgré un petit retard.',
                'statut' => 'approuvé'
            ]
        ];

        foreach ($avisData as $avisItem) {
            $avis = new Avis();
            $avis->setCovoiturage($avisItem['covoiturage']);
            $avis->setAuteur($avisItem['auteur']);
            $avis->setNote($avisItem['note']);
            $avis->setCommentaire($avisItem['commentaire']);
            $avis->setStatut($avisItem['statut']);

            $manager->persist($avis);
        }

        // Flush pour obtenir les IDs
        $manager->flush();

        // Ajouter des réservations aux covoiturages
        $covoiturageEntities[0]->addPassenger($utilisateurEntities[1]);
        $covoiturageEntities[0]->addPassenger($utilisateurEntities[3]);
        $covoiturageEntities[1]->addPassenger($utilisateurEntities[2]);
        $covoiturageEntities[2]->addPassenger($utilisateurEntities[0]);

        $manager->flush();
    }
}
