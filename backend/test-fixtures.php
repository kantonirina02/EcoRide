<?php

require_once __DIR__ . '/vendor/autoload.php';

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Dotenv\Dotenv;

echo "=== TEST DES FIXTURES SIMPLIFIÉ ===\n\n";

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

    // Vider la base de données
    $entityManager->getConnection()->executeQuery('DELETE FROM avis');
    $entityManager->getConnection()->executeQuery('DELETE FROM covoiturage_utilisateur');
    $entityManager->getConnection()->executeQuery('DELETE FROM covoiturage');
    $entityManager->getConnection()->executeQuery('DELETE FROM voiture');
    $entityManager->getConnection()->executeQuery('DELETE FROM utilisateur_role');
    $entityManager->getConnection()->executeQuery('DELETE FROM utilisateur');
    $entityManager->getConnection()->executeQuery('DELETE FROM role');
    $entityManager->getConnection()->executeQuery('DELETE FROM marque');

    echo "2. Base de données vidée\n\n";

    // Créer les entités dans l'ordre correct
    echo "3. Création des rôles...\n";
    $roleAdmin = new \App\Entity\Role();
    $roleAdmin->setLibelle('ROLE_ADMIN');
    $entityManager->persist($roleAdmin);

    $roleUser = new \App\Entity\Role();
    $roleUser->setLibelle('ROLE_USER');
    $entityManager->persist($roleUser);
    $entityManager->flush();

    echo "✅ Rôles créés\n\n";

    echo "4. Création d'un utilisateur...\n";
    $user = new \App\Entity\Utilisateur();
    $user->setNom('Test');
    $user->setPrenom('User');
    $user->setEmail('test@example.com');
    $user->setPseudo('testuser');
    $user->setPassword('test123');
    $user->addRole($roleUser);
    $entityManager->persist($user);
    $entityManager->flush();

    echo "✅ Utilisateur créé avec ID: " . $user->getId() . "\n\n";

    echo "5. Création d'une marque...\n";
    $marque = new \App\Entity\Marque();
    $marque->setLibelle('TestMarque');
    $entityManager->persist($marque);
    $entityManager->flush();

    echo "✅ Marque créée avec ID: " . $marque->getId() . "\n\n";

    echo "6. Création d'une voiture...\n";
    $voiture = new \App\Entity\Voiture();
    $voiture->setMarque($marque);
    $voiture->setModele('TestModel');
    $voiture->setImmatriculation('AA-123-AA');
    $voiture->setCouleur('Rouge');
    $voiture->setUtilisateur($user);
    $entityManager->persist($voiture);
    $entityManager->flush();

    echo "✅ Voiture créée avec ID: " . $voiture->getId() . "\n\n";

    echo "7. Création d'un covoiturage...\n";
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

    echo "8. Création d'un avis...\n";
    $avis = new \App\Entity\Avis();
    $avis->setNote(4);
    $avis->setCommentaire('Test avis');
    $avis->setStatut('approuvé');
    $avis->setAuteur($user);
    $avis->setCovoiturage($covoiturage);

    // Ajouter les relations bidirectionnelles
    $user->addAvisDonne($avis);
    $covoiturage->addAvisRecu($avis);

    $entityManager->persist($avis);
    $entityManager->flush();

    echo "✅ Avis créé avec ID: " . $avis->getId() . "\n\n";

    echo "🎉 Tous les tests sont passés!\n";

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
