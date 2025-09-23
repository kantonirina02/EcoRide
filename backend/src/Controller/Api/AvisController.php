<?php

namespace App\Controller\Api;

use App\Entity\Avis;
use App\Entity\Utilisateur;
use App\Entity\Covoiturage;
use App\Repository\AvisRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/avis', name: 'api_avis_')]
class AvisController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private AvisRepository $avisRepository
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $covoiturageId = $request->query->get('covoiturageId');
        $auteurId = $request->query->get('auteurId');

        $criteria = [];

        if ($covoiturageId) {
            $criteria['covoiturage'] = $covoiturageId;
        }
        if ($auteurId) {
            $criteria['auteur'] = $auteurId;
        }

        $avis = $this->avisRepository->findBy($criteria, ['id' => 'DESC']);

        $data = [];
        foreach ($avis as $avi) {
            $data[] = $this->serializeAvis($avi);
        }

        return $this->json($data);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Avis $avis): JsonResponse
    {
        return $this->json($this->serializeAvis($avis, true));
    }

    #[Route('/new', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'error' => 'Données JSON invalides'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validation des données requises
        $requiredFields = ['covoiturageId', 'note', 'commentaire'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return $this->json([
                    'error' => "Champ requis manquant: $field"
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        // Validation de la note
        if ($data['note'] < 1 || $data['note'] > 5) {
            return $this->json([
                'error' => 'La note doit être comprise entre 1 et 5'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer le covoiturage
        $covoiturage = $this->entityManager->getRepository(Covoiturage::class)->find($data['covoiturageId']);
        if (!$covoiturage) {
            return $this->json([
                'error' => 'Covoiturage non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'utilisateur a participé au covoiturage
        if (!$covoiturage->getPassengers()->contains($user) && $covoiturage->getVoiture()->getUtilisateur() !== $user) {
            return $this->json([
                'error' => 'Vous ne pouvez pas donner d\'avis sur ce covoiturage'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier que l'utilisateur n'a pas déjà donné d'avis pour ce covoiturage
        $existingAvis = $this->avisRepository->findOneBy([
            'auteur' => $user,
            'covoiturage' => $covoiturage
        ]);

        if ($existingAvis) {
            return $this->json([
                'error' => 'Vous avez déjà donné un avis pour ce covoiturage'
            ], Response::HTTP_CONFLICT);
        }

        try {
            $avis = new Avis();
            $avis->setNote($data['note']);
            $avis->setCommentaire($data['commentaire']);
            $avis->setStatut('approuvé'); // Par défaut, approuvé
            $avis->setAuteur($user);
            $avis->setCovoiturage($covoiturage);

            $this->entityManager->persist($avis);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Avis créé avec succès',
                'avis' => $this->serializeAvis($avis)
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la création: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(Request $request, Avis $avis, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        // Vérifier que l'utilisateur est l'auteur de l'avis
        if ($avis->getAuteur() !== $user) {
            return $this->json([
                'error' => 'Non autorisé à modifier cet avis'
            ], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'error' => 'Données JSON invalides'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Mettre à jour les champs fournis
            if (isset($data['note'])) {
                if ($data['note'] < 1 || $data['note'] > 5) {
                    return $this->json([
                        'error' => 'La note doit être comprise entre 1 et 5'
                    ], Response::HTTP_BAD_REQUEST);
                }
                $avis->setNote($data['note']);
            }
            if (isset($data['commentaire'])) {
                $avis->setCommentaire($data['commentaire']);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Avis mis à jour avec succès',
                'avis' => $this->serializeAvis($avis)
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(Avis $avis, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        // Vérifier que l'utilisateur est l'auteur de l'avis
        if ($avis->getAuteur() !== $user) {
            return $this->json([
                'error' => 'Non autorisé à supprimer cet avis'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $this->entityManager->remove($avis);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Avis supprimé avec succès'
            ], Response::HTTP_NO_CONTENT);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/covoiturage/{id}/moyenne', name: 'covoiturage_moyenne', methods: ['GET'])]
    public function getCovoiturageMoyenne(Covoiturage $covoiturage): JsonResponse
    {
        $avis = $covoiturage->getAvisRecus();
        $total = $avis->count();

        if ($total === 0) {
            return $this->json([
                'moyenne' => 0,
                'total' => 0
            ]);
        }

        $somme = 0;
        foreach ($avis as $avi) {
            $somme += $avi->getNote();
        }

        $moyenne = round($somme / $total, 1);

        return $this->json([
            'moyenne' => $moyenne,
            'total' => $total
        ]);
    }

    #[Route('/utilisateur/{id}/moyenne', name: 'utilisateur_moyenne', methods: ['GET'])]
    public function getUtilisateurMoyenne(Utilisateur $utilisateur): JsonResponse
    {
        // Récupérer tous les avis reçus par l'utilisateur (en tant que conducteur)
        $covoiturages = $utilisateur->getVoitures();
        $avis = [];

        foreach ($covoiturages as $voiture) {
            foreach ($voiture->getCovoiturages() as $covoiturage) {
                foreach ($covoiturage->getAvisRecus() as $avi) {
                    $avis[] = $avi;
                }
            }
        }

        $total = count($avis);

        if ($total === 0) {
            return $this->json([
                'moyenne' => 0,
                'total' => 0
            ]);
        }

        $somme = 0;
        foreach ($avis as $avi) {
            $somme += $avi->getNote();
        }

        $moyenne = round($somme / $total, 1);

        return $this->json([
            'moyenne' => $moyenne,
            'total' => $total
        ]);
    }

    private function serializeAvis(Avis $avis, bool $detailed = false): array
    {
        $data = [
            'id' => $avis->getId(),
            'note' => $avis->getNote(),
            'commentaire' => $avis->getCommentaire(),
            'statut' => $avis->getStatut(),
            'dateCreation' => $avis->getId() ? (new \DateTime())->format('Y-m-d H:i:s') : null, // Approximatif
            'auteur' => [
                'id' => $avis->getAuteur()->getId(),
                'nom' => $avis->getAuteur()->getNom(),
                'prenom' => $avis->getAuteur()->getPrenom(),
                'pseudo' => $avis->getAuteur()->getPseudo()
            ],
            'covoiturage' => [
                'id' => $avis->getCovoiturage()->getId(),
                'dateDepart' => $avis->getCovoiturage()->getDateDepart()?->format('Y-m-d'),
                'lieuDepart' => $avis->getCovoiturage()->getLieuDepart(),
                'lieuArrivee' => $avis->getCovoiturage()->getLieuArrivee()
            ]
        ];

        return $data;
    }
}
