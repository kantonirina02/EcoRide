<?php

namespace App\Controller\Api;

use App\Entity\Covoiturage;
use App\Entity\Utilisateur;
use App\Repository\CovoiturageRepository;
use App\Repository\VoitureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/covoiturages', name: 'api_covoiturage_')]
class CovoiturageController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CovoiturageRepository $covoiturageRepository,
        private VoitureRepository $voitureRepository
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $depart = $request->query->get('depart');
        $arrivee = $request->query->get('arrivee');
        $date = $request->query->get('date');

        $criteria = [];

        if ($depart) {
            $criteria['lieuDepart'] = $depart;
        }
        if ($arrivee) {
            $criteria['lieuArrivee'] = $arrivee;
        }
        if ($date) {
            try {
                $dateObj = new \DateTime($date);
                $criteria['dateDepart'] = $dateObj;
            } catch (\Exception $e) {
                return $this->json([
                    'error' => 'Format de date invalide'
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        $covoiturages = $this->covoiturageRepository->findBy($criteria, ['dateDepart' => 'ASC']);

        $data = [];
        foreach ($covoiturages as $covoiturage) {
            $data[] = $this->serializeCovoiturage($covoiturage);
        }

        return $this->json($data);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Covoiturage $covoiturage): JsonResponse
    {
        return $this->json($this->serializeCovoiturage($covoiturage, true));
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
        $requiredFields = ['dateDepart', 'heureDepart', 'lieuDepart', 'dateArrivee', 'heureArrivee', 'lieuArrivee', 'nbPlace', 'prixPersonne', 'voitureId'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return $this->json([
                    'error' => "Champ requis manquant: $field"
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        // Vérifier que l'utilisateur possède la voiture
        $voiture = $this->voitureRepository->find($data['voitureId']);
        if (!$voiture || $voiture->getUtilisateur() !== $user) {
            return $this->json([
                'error' => 'Voiture non trouvée ou non autorisée'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $covoiturage = new Covoiturage();

            $dateDepart = new \DateTime($data['dateDepart'] . ' ' . $data['heureDepart']);
            $dateArrivee = new \DateTime($data['dateArrivee'] . ' ' . $data['heureArrivee']);

            $covoiturage->setDateDepart($dateDepart);
            $covoiturage->setHeureDepart($dateDepart);
            $covoiturage->setDateArrivee($dateArrivee);
            $covoiturage->setHeureArrivee($dateArrivee);
            $covoiturage->setLieuDepart($data['lieuDepart']);
            $covoiturage->setLieuArrivee($data['lieuArrivee']);
            $covoiturage->setNbPlace($data['nbPlace']);
            $covoiturage->setPrixPersonne($data['prixPersonne']);
            $covoiturage->setStatus('disponible');
            $covoiturage->setVoiture($voiture);

            $this->entityManager->persist($covoiturage);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Covoiturage créé avec succès',
                'covoiturage' => $this->serializeCovoiturage($covoiturage)
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la création: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(Request $request, Covoiturage $covoiturage, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        // Vérifier que l'utilisateur est propriétaire du covoiturage
        if ($covoiturage->getVoiture()->getUtilisateur() !== $user) {
            return $this->json([
                'error' => 'Non autorisé à modifier ce covoiturage'
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
            if (isset($data['dateDepart']) && isset($data['heureDepart'])) {
                $dateDepart = new \DateTime($data['dateDepart'] . ' ' . $data['heureDepart']);
                $covoiturage->setDateDepart($dateDepart);
                $covoiturage->setHeureDepart($dateDepart);
            }

            if (isset($data['dateArrivee']) && isset($data['heureArrivee'])) {
                $dateArrivee = new \DateTime($data['dateArrivee'] . ' ' . $data['heureArrivee']);
                $covoiturage->setDateArrivee($dateArrivee);
                $covoiturage->setHeureArrivee($dateArrivee);
            }

            if (isset($data['lieuDepart'])) {
                $covoiturage->setLieuDepart($data['lieuDepart']);
            }
            if (isset($data['lieuArrivee'])) {
                $covoiturage->setLieuArrivee($data['lieuArrivee']);
            }
            if (isset($data['nbPlace'])) {
                $covoiturage->setNbPlace($data['nbPlace']);
            }
            if (isset($data['prixPersonne'])) {
                $covoiturage->setPrixPersonne($data['prixPersonne']);
            }
            if (isset($data['status'])) {
                $covoiturage->setStatus($data['status']);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Covoiturage mis à jour avec succès',
                'covoiturage' => $this->serializeCovoiturage($covoiturage)
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(Covoiturage $covoiturage, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        // Vérifier que l'utilisateur est propriétaire du covoiturage
        if ($covoiturage->getVoiture()->getUtilisateur() !== $user) {
            return $this->json([
                'error' => 'Non autorisé à supprimer ce covoiturage'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $this->entityManager->remove($covoiturage);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Covoiturage supprimé avec succès'
            ], Response::HTTP_NO_CONTENT);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/reserver', name: 'reserver', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function reserver(Covoiturage $covoiturage, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        // Vérifier que l'utilisateur n'est pas le propriétaire
        if ($covoiturage->getVoiture()->getUtilisateur() === $user) {
            return $this->json([
                'error' => 'Vous ne pouvez pas réserver votre propre covoiturage'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que le covoiturage est disponible
        if ($covoiturage->getStatus() !== 'disponible') {
            return $this->json([
                'error' => 'Ce covoiturage n\'est plus disponible'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier qu'il reste des places
        if ($covoiturage->getPassengers()->count() >= $covoiturage->getNbPlace()) {
            return $this->json([
                'error' => 'Plus de places disponibles'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que l'utilisateur n'a pas déjà réservé
        if ($covoiturage->getPassengers()->contains($user)) {
            return $this->json([
                'error' => 'Vous avez déjà réservé ce covoiturage'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $covoiturage->addPassenger($user);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Réservation effectuée avec succès',
                'covoiturage' => $this->serializeCovoiturage($covoiturage)
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la réservation: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/annuler-reservation', name: 'annuler_reservation', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function annulerReservation(Covoiturage $covoiturage, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        // Vérifier que l'utilisateur a bien réservé
        if (!$covoiturage->getPassengers()->contains($user)) {
            return $this->json([
                'error' => 'Vous n\'avez pas réservé ce covoiturage'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $covoiturage->removePassenger($user);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Réservation annulée avec succès'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de l\'annulation: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function serializeCovoiturage(Covoiturage $covoiturage, bool $detailed = false): array
    {
        $data = [
            'id' => $covoiturage->getId(),
            'dateDepart' => $covoiturage->getDateDepart()?->format('Y-m-d H:i:s'),
            'heureDepart' => $covoiturage->getHeureDepart()?->format('H:i:s'),
            'lieuDepart' => $covoiturage->getLieuDepart(),
            'dateArrivee' => $covoiturage->getDateArrivee()?->format('Y-m-d H:i:s'),
            'heureArrivee' => $covoiturage->getHeureArrivee()?->format('H:i:s'),
            'lieuArrivee' => $covoiturage->getLieuArrivee(),
            'status' => $covoiturage->getStatus(),
            'nbPlace' => $covoiturage->getNbPlace(),
            'prixPersonne' => $covoiturage->getPrixPersonne(),
            'placesRestantes' => $covoiturage->getNbPlace() - $covoiturage->getPassengers()->count(),
            'conducteur' => [
                'id' => $covoiturage->getVoiture()->getUtilisateur()->getId(),
                'nom' => $covoiturage->getVoiture()->getUtilisateur()->getNom(),
                'prenom' => $covoiturage->getVoiture()->getUtilisateur()->getPrenom(),
                'pseudo' => $covoiturage->getVoiture()->getUtilisateur()->getPseudo()
            ],
            'voiture' => [
                'id' => $covoiturage->getVoiture()->getId(),
                'modele' => $covoiturage->getVoiture()->getModele(),
                'marque' => $covoiturage->getVoiture()->getMarque()->getLibelle(),
                'couleur' => $covoiturage->getVoiture()->getCouleur(),
                'immatriculation' => $covoiturage->getVoiture()->getImmatriculation()
            ]
        ];

        if ($detailed) {
            $data['passagers'] = [];
            foreach ($covoiturage->getPassengers() as $passager) {
                $data['passagers'][] = [
                    'id' => $passager->getId(),
                    'nom' => $passager->getNom(),
                    'prenom' => $passager->getPrenom(),
                    'pseudo' => $passager->getPseudo()
                ];
            }

            $data['avis'] = [];
            foreach ($covoiturage->getAvisRecus() as $avis) {
                $data['avis'][] = [
                    'id' => $avis->getId(),
                    'note' => $avis->getNote(),
                    'commentaire' => $avis->getCommentaire(),
                    'auteur' => [
                        'id' => $avis->getAuteur()->getId(),
                        'nom' => $avis->getAuteur()->getNom(),
                        'prenom' => $avis->getAuteur()->getPrenom(),
                        'pseudo' => $avis->getAuteur()->getPseudo()
                    ]
                ];
            }
        }

        return $data;
    }
}
