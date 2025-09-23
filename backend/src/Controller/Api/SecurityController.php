<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/security', name: 'api_security_')]
class SecurityController extends AbstractController
{
    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof Utilisateur) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'pseudo' => $user->getPseudo(),
        ]);
    }

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof Utilisateur) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'email' => $user->getEmail(),
            'telephone' => $user->getTelephone(),
            'adresse' => $user->getAdresse(),
            'dateNaissance' => $user->getDateNaissance()?->format('Y-m-d'),
            'photo' => $user->getPhoto(),
            'pseudo' => $user->getPseudo(),
        ]);
    }
}
