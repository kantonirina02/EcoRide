<?php

require_once __DIR__ . '/vendor/autoload.php';

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Dotenv\Dotenv;

echo "=== TEST DES DONNÉES DE L'APPLICATION ECORIDE ===\n\n";

// Charger les variables d'environnement
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env.local');

try {
    // Créer l'entity manager
    $kernel = new \App\Kernel('dev', true);
    $kernel->boot();
    $entityManager = $kernel->getContainer()->get('doctrine')->getManager();

    echo "1. Test de la connexion à la base de données...\n";
    $connection = $entityManager->getConnection();
    $connection->connect();
    echo "✅ Connexion réussie\n\n";

    echo "2. Vérification des données en base...\n";

    // Compter les utilisateurs
    $utilisateurs = $entityManager->getRepository(\App\Entity\Utilisateur::class)->count([]);
    echo "   Utilisateurs: $utilisateurs\n";

    // Compter les rôles
    $roles = $entityManager->getRepository(\App\Entity\Role::class)->count([]);
    echo "   Rôles: $roles\n";

    // Compter les marques
    $marques = $entityManager->getRepository(\App\Entity\Marque::class)->count([]);
    echo "   Marques: $marques\n";

    // Compter les voitures
    $voitures = $entityManager->getRepository(\App\Entity\Voiture::class)->count([]);
    echo "   Voitures: $voitures\n";

    // Compter les covoiturages
    $covoiturages = $entityManager->getRepository(\App\Entity\Covoiturage::class)->count([]);
    echo "   Covoiturages: $covoiturages\n";

    // Compter les avis
    $avis = $entityManager->getRepository(\App\Entity\Avis::class)->count([]);
    echo "   Avis: $avis\n\n";

    echo "3. Validation du schéma...\n";
    $validator = $kernel->getContainer()->get('validator');
    echo "✅ Services chargés correctement\n\n";

    echo "=== RAPPORT FINAL ===\n";
    echo "Données en base de données:\n";
    echo "- Utilisateurs: $utilisateurs (attendu: ~10)\n";
    echo "- Rôles: $roles (attendu: 2-4)\n";
    echo "- Marques: $marques (attendu: ~5)\n";
    echo "- Voitures: $voitures (attendu: ~5)\n";
    echo "- Covoiturages: $covoiturages (attendu: ~10)\n";
    echo "- Avis: $avis (attendu: ~15)\n\n";

    if ($utilisateurs > 0 && $roles > 0 && $covoiturages > 0) {
        echo "🎉 L'application semble fonctionnelle avec des données de test!\n\n";
        echo "Pour démarrer l'application:\n";
        echo "1. Backend: symfony server:start -d\n";
        echo "2. Frontend: npm run dev\n";
        echo "3. Accès: http://127.0.0.1:8000 (backend) et http://127.0.0.1:8080 (frontend)\n";
    } else {
        echo "⚠️  Des problèmes subsistent. Vérifiez les logs et relancez les fixtures.\n";
        echo "Commande: php bin/console doctrine:fixtures:load --no-interaction\n";
    }

} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Vérifiez votre configuration .env.local\n";
}
