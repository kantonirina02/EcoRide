<?php

require_once __DIR__ . '/vendor/autoload.php';

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Dotenv\Dotenv;

echo "=== DEBUG DES FIXTURES ===\n\n";

try {
    // Charger les variables d'environnement
    $dotenv = new Dotenv();
    $dotenv->load(__DIR__ . '/.env.local');

    // Créer l'entity manager
    $kernel = new \App\Kernel('dev', true);
    $kernel->boot();
    $entityManager = $kernel->getContainer()->get('doctrine')->getManager();

    echo "1. Test de la connexion...\n";
    $connection = $entityManager->getConnection();
    $connection->connect();
    echo "✅ Connexion réussie\n\n";

    echo "2. Vérification du schéma...\n";
    $schemaManager = $connection->createSchemaManager();
    $tables = $schemaManager->listTables();

    echo "Tables trouvées:\n";
    foreach ($tables as $table) {
        echo "- " . $table->getName() . "\n";
    }
    echo "\n";

    echo "3. Test de création d'un utilisateur simple...\n";
    $utilisateur = new \App\Entity\Utilisateur();
    $utilisateur->setNom('Test');
    $utilisateur->setPrenom('User');
    $utilisateur->setEmail('test@example.com');
    $utilisateur->setPseudo('testuser');
    $utilisateur->setPassword('test123');
    $utilisateur->setCredits(20);

    $entityManager->persist($utilisateur);
    $entityManager->flush();

    echo "✅ Utilisateur créé avec ID: " . $utilisateur->getId() . "\n\n";

    echo "4. Test de création d'un rôle...\n";
    $role = new \App\Entity\Role();
    $role->setLibelle('ROLE_TEST');
    $entityManager->persist($role);
    $entityManager->flush();

    echo "✅ Rôle créé avec ID: " . $role->getId() . "\n\n";

    echo "5. Test de liaison utilisateur-rôle...\n";
    $utilisateur->addRole($role);
    $entityManager->flush();

    echo "✅ Liaison réussie\n\n";

    echo "6. Test de création d'une marque...\n";
    $marque = new \App\Entity\Marque();
    $marque->setLibelle('TestMarque');
    $entityManager->persist($marque);
    $entityManager->flush();

    echo "✅ Marque créée avec ID: " . $marque->getId() . "\n\n";

    echo "7. Test de création d'une voiture...\n";
    $voiture = new \App\Entity\Voiture();
    $voiture->setMarque($marque);
    $voiture->setModele('TestModel');
    $voiture->setImmatriculation('AA-123-AA');
    $voiture->setCouleur('Rouge');
    $voiture->setUtilisateur($utilisateur); // L'utilisateur est requis

    $entityManager->persist($voiture);
    $entityManager->flush();

    echo "✅ Voiture créée avec ID: " . $voiture->getId() . "\n\n";

    echo "8. Test de liaison utilisateur-voiture...\n";
    $utilisateur->addVoiture($voiture);
    $entityManager->flush();

    echo "✅ Liaison réussie\n\n";

    echo "9. Test de création d'un covoiturage...\n";
    $covoiturage = new \App\Entity\Covoiturage();
    $covoiturage->setDateDepart(new \DateTime('+5 days'));
    $covoiturage->setHeureDepart(new \DateTime('+5 days'));
    $covoiturage->setDateArrivee(new \DateTime('+5 days 6 hours'));
    $covoiturage->setHeureArrivee(new \DateTime('+5 days 6 hours'));
    $covoiturage->setLieuDepart('Paris');
    $covoiturage->setLieuArrivee('Lyon');
    $covoiturage->setStatus('disponible');
    $covoiturage->setNbPlace(3);
    $covoiturage->setPrixPersonne(25);
    $covoiturage->setVoiture($voiture);

    $entityManager->persist($covoiturage);
    $entityManager->flush();

    echo "✅ Covoiturage créé avec ID: " . $covoiturage->getId() . "\n\n";

    echo "10. Test de création d'un avis...\n";
    $avis = new \App\Entity\Avis();
    $avis->setNote(4);
    $avis->setCommentaire('Test avis');
    $avis->setStatut('approuvé');
    $avis->setAuteur($utilisateur);
    $avis->setCovoiturage($covoiturage);

    $utilisateur->addAvisDonne($avis);

    $entityManager->persist($avis);
    $entityManager->flush();

    echo "✅ Avis créé avec ID: " . $avis->getId() . "\n\n";

    echo "🎉 Tous les tests sont passés!\n";
    echo "Le problème vient probablement de l'ordre de création dans les fixtures.\n";

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
