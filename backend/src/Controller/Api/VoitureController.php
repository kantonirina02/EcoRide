<?php

namespace App\Controller\Api;

use App\Entity\Voiture;
use App\Entity\Utilisateur;
use App\Repository\VoitureRepository;
use App\Repository\MarqueRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/voitures', name: 'api_voiture_')]
class VoitureController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private VoitureRepository $voitureRepository,
        private MarqueRepository $marqueRepository
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(#[CurrentUser] Utilisateur $user): JsonResponse
    {
        $voitures = $this->voitureRepository->findBy(['utilisateur' => $user]);

        $data = [];
        foreach ($voitures as $voiture) {
            $data[] = $this->serializeVoiture($voiture);
        }

        return $this->json($data);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function show(Voiture $voiture, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        if ($voiture->getUtilisateur() !== $user) {
            return $this->json([
                'error' => 'Non autorisé à voir cette voiture'
            ], Response::HTTP_FORBIDDEN);
        }

        return $this->json($this->serializeVoiture($voiture, true));
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
        $requiredFields = ['modele', 'marqueId', 'immatriculation', 'couleur'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return $this->json([
                    'error' => "Champ requis manquant: $field"
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        // Vérifier que la marque existe
        $marque = $this->marqueRepository->find($data['marqueId']);
        if (!$marque) {
            return $this->json([
                'error' => 'Marque non trouvée'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que l'immatriculation n'est pas déjà utilisée
        $existingVoiture = $this->voitureRepository->findOneBy(['immatriculation' => $data['immatriculation']]);
        if ($existingVoiture) {
            return $this->json([
                'error' => 'Cette immatriculation est déjà utilisée'
            ], Response::HTTP_CONFLICT);
        }

        try {
            $voiture = new Voiture();
            $voiture->setModele($data['modele']);
            $voiture->setMarque($marque);
            $voiture->setImmatriculation($data['immatriculation']);
            $voiture->setCouleur($data['couleur']);
            $voiture->setUtilisateur($user);

            // Champs optionnels
            if (isset($data['energie'])) {
                $voiture->setEnergie($data['energie']);
            }
            if (isset($data['datePremiereImmatriculation'])) {
                $voiture->setDatePremiereImmatriculation(new \DateTime($data['datePremiereImmatriculation']));
            }

            $this->entityManager->persist($voiture);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Voiture créée avec succès',
                'voiture' => $this->serializeVoiture($voiture)
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la création: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(Request $request, Voiture $voiture, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        if ($voiture->getUtilisateur() !== $user) {
            return $this->json([
                'error' => 'Non autorisé à modifier cette voiture'
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
            if (isset($data['modele'])) {
                $voiture->setModele($data['modele']);
            }
            if (isset($data['couleur'])) {
                $voiture->setCouleur($data['couleur']);
            }
            if (isset($data['energie'])) {
                $voiture->setEnergie($data['energie']);
            }
            if (isset($data['datePremiereImmatriculation'])) {
                $voiture->setDatePremiereImmatriculation(new \DateTime($data['datePremiereImmatriculation']));
            }

            // Vérifier l'immatriculation si elle est modifiée
            if (isset($data['immatriculation']) && $data['immatriculation'] !== $voiture->getImmatriculation()) {
                $existingVoiture = $this->voitureRepository->findOneBy(['immatriculation' => $data['immatriculation']]);
                if ($existingVoiture) {
                    return $this->json([
                        'error' => 'Cette immatriculation est déjà utilisée'
                    ], Response::HTTP_CONFLICT);
                }
                $voiture->setImmatriculation($data['immatriculation']);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Voiture mise à jour avec succès',
                'voiture' => $this->serializeVoiture($voiture)
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(Voiture $voiture, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        if ($voiture->getUtilisateur() !== $user) {
            return $this->json([
                'error' => 'Non autorisé à supprimer cette voiture'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier qu'aucun covoiturage n'utilise cette voiture
        if ($voiture->getCovoiturages()->count() > 0) {
            return $this->json([
                'error' => 'Impossible de supprimer cette voiture car elle est utilisée dans des covoiturages'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->remove($voiture);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Voiture supprimée avec succès'
            ], Response::HTTP_NO_CONTENT);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/marques', name: 'marques', methods: ['GET'])]
    public function getMarques(): JsonResponse
    {
        $marques = $this->marqueRepository->findAll();

        $data = [];
        foreach ($marques as $marque) {
            $data[] = [
                'id' => $marque->getId(),
                'libelle' => $marque->getLibelle()
            ];
        }

        return $this->json($data);
    }

    private function serializeVoiture(Voiture $voiture, bool $detailed = false): array
    {
        $data = [
            'id' => $voiture->getId(),
            'modele' => $voiture->getModele(),
            'marque' => [
                'id' => $voiture->getMarque()->getId(),
                'libelle' => $voiture->getMarque()->getLibelle()
            ],
            'immatriculation' => $voiture->getImmatriculation(),
            'couleur' => $voiture->getCouleur(),
            'energie' => $voiture->getEnergie(),
            'datePremiereImmatriculation' => $voiture->getDatePremiereImmatriculation()?->format('Y-m-d'),
            'proprietaire' => [
                'id' => $voiture->getUtilisateur()->getId(),
                'nom' => $voiture->getUtilisateur()->getNom(),
                'prenom' => $voiture->getUtilisateur()->getPrenom()
            ]
        ];

        if ($detailed) {
            $data['covoiturages'] = [];
            foreach ($voiture->getCovoiturages() as $covoiturage) {
                $data['covoiturages'][] = [
                    'id' => $covoiturage->getId(),
                    'dateDepart' => $covoiturage->getDateDepart()?->format('Y-m-d H:i:s'),
                    'lieuDepart' => $covoiturage->getLieuDepart(),
                    'lieuArrivee' => $covoiturage->getLieuArrivee(),
                    'status' => $covoiturage->getStatus()
                ];
            }
        }

        return $data;
    }
}
