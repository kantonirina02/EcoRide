<?php

namespace App\Controller\Api; 

use App\Entity\Role; 
use App\Entity\Utilisateur;
use App\Repository\RoleRepository;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse; 
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface; 
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert; 
use Symfony\Component\Security\Http\Attribute\IsGranted; 

// Préfixe pour toutes les routes de ce contrôleur

class SecurityController extends AbstractController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(
        Request $request,
        UtilisateurRepository $userRepository,
        RoleRepository $roleRepository, // Injecter RoleRepository
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        // 1. Récupérer les données JSON du corps de la requête
        $data = json_decode($request->getContent(), true);

        // --- Validation Simple des Données Reçues (avant création entité) ---
        // Vérifier que les clés nécessaires sont présentes
        if (empty($data['pseudo']) || empty($data['email']) || empty($data['password']) || empty($data['nom']) || empty($data['prenom'])) {
             return $this->json(['message' => 'Données incomplètes. Pseudo, email, password, nom et prenom sont requis.'], Response::HTTP_BAD_REQUEST); // 400
        }

        // Vérifier si l'email ou le pseudo existent déjà
        if ($userRepository->findOneBy(['email' => $data['email']])) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], Response::HTTP_CONFLICT); // 409 Conflict
        }
        if ($userRepository->findOneBy(['pseudo' => $data['pseudo']])) {
            return $this->json(['message' => 'Ce pseudo est déjà utilisé.'], Response::HTTP_CONFLICT); // 409 Conflict
        }
        
        if (strlen($data['password']) < 6) { 
             return $this->json(['message' => 'Le mot de passe doit faire au moins 6 caractères.'], Response::HTTP_BAD_REQUEST);
        }
       

        // 2. Créer une nouvelle instance Utilisateur+
        $user = new Utilisateur();
        $user->setPseudo($data['pseudo']);
        $user->setEmail($data['email']);
        $user->setNom($data['nom']);
        $user->setPrenom($data['prenom']);
        // Les crédits sont initialisés à 20 par le constructeur
        // 3. Hacher le mot de passe
        $hashedPassword = $passwordHasher->hashPassword(
            $user,
            $data['password'] // Mot de passe en clair reçu
        );
        $user->setPassword($hashedPassword);

        // 4. Assigner le rôle USER par défaut
        // ATTENTION: Remplace 'ROLE_USER' par le libellé exact de ton rôle dans la BDD
        // ou utilise un ID ou une constante si c'est plus sûr.
        $defaultRoleLabel = 'ROLE_USER'; // Ou 'Utilisateur', 'Passager'... ce qui est dans ta table Role
        $userRole = $roleRepository->findOneBy(['libelle' => $defaultRoleLabel]);

        if (!$userRole) {
            // Gérer le cas où le rôle par défaut n'existe pas en BDD !
            // Soit le créer, soit renvoyer une erreur serveur.
            // Pour l'instant, on renvoie une erreur.
             error_log("Le rôle par défaut '$defaultRoleLabel' n'a pas été trouvé en base de données !");
             return $this->json(['message' => 'Erreur de configuration interne du serveur.'], Response::HTTP_INTERNAL_SERVER_ERROR); // 500
        }
        $user->addRole($userRole); // Ajoute le rôle à la collection de l'utilisateur

        // 5. Valider l'entité Utilisateur complète avec le Validateur Symfony
        // Cela vérifie les contraintes @Assert dans l'entité (NotBlank, Email, etc.)
        $errors = $validator->validate($user);

        if (count($errors) > 0) {
            // S'il y a des erreurs de validation Doctrine/Symfony
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['message' => 'Erreurs de validation.', 'errors' => $errorMessages], Response::HTTP_UNPROCESSABLE_ENTITY); // 422 Unprocessable Entity
        }

        // 6. Persister l'utilisateur en base de données
        try {
            $entityManager->persist($user);
            $entityManager->flush();
        } catch (\Exception $e) {
             // Gérer les erreurs potentielles de la BDD (ex: contrainte unique violée malgré la vérif précédente - race condition)
             error_log("Erreur BDD lors de l'inscription: " . $e->getMessage());
             return $this->json(['message' => "Une erreur s'est produite lors de l'enregistrement."], Response::HTTP_INTERNAL_SERVER_ERROR); // 500
        }


        // 7. Renvoyer une réponse de succès
        return $this->json(
            ['message' => 'Utilisateur créé avec succès !'],
            Response::HTTP_CREATED // 201 Created
        );
    }

     // --- On ajoutera la route /api/login_check ici plus tard si besoin ---
     // Normalement LexikJWTAuthenticationBundle la gère automatiquement
     // #[Route('/login_check', name: 'login_check', methods: ['POST'])]
     // public function loginCheck() { /* Laissé vide, géré par le bundle */ }

     // --- Route pour récupérer l'utilisateur connecté (exemple) ---
     #[Route('/me', name: 'me', methods: ['GET'])]
      #[IsGranted('IS_AUTHENTICATED_FULLY')] // Sécurise la route
     public function getCurrentUser(): JsonResponse
     {
         $user = $this->getUser(); // Récupère l'utilisateur actuellement authentifié

         if (!$user instanceof Utilisateur) {
              return $this->json(['message' => 'Utilisateur non trouvé ou non authentifié.'], Response::HTTP_UNAUTHORIZED);
         }

         // Utilise les groupes de sérialisation pour ne renvoyer que certaines infos
         // 'user:read' exclut normalement le mot de passe
         return $this->json($user, Response::HTTP_OK, [], ['groups' => 'user:read']);
     }
}
