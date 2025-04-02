<?php

namespace App\Controller;

use App\Entity\Covoiturage;
use App\Entity\Voiture; 
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use App\Repository\CovoiturageRepository;
use App\Repository\VoitureRepository; 
use DateTimeImmutable;

#[Route('api/covoiturage', name: 'app_api_covoiturage_')]
final class CovoiturageController extends AbstractController
{
    // Injection de dépendances via le constructeur
    public function __construct(
        private EntityManagerInterface $manager,
        private CovoiturageRepository $repository,
        private VoitureRepository $voitureRepository // Injectez VoitureRepository
    ) {
    }

    #[Route('/new', name: 'new', methods: ['POST'])] // J'ai simplifié le nom de la route ici aussi
    public function new(): Response
    {
        $covoiturage = new Covoiturage();

        // Correction de la casse des setters et ajout de la relation Voiture
        try {
            // Récupérer une voiture pour la relation (adaptez l'ID ou la logique)
            $voiture = $this->voitureRepository->find(1); // !! Adaptez ceci !!
            if (!$voiture) {
                // Gérer le cas où aucune voiture n'est trouvée pour le test
                 return $this->json(['error' => 'Aucune voiture de test trouvée avec l\'ID 1'], Response::HTTP_BAD_REQUEST);
            }

            $covoiturage->setDateDepart(new DateTimeImmutable()); 
            $covoiturage->setHeureDepart(new DateTimeImmutable()); 
            $covoiturage->setDateArrivee(new DateTimeImmutable()); 
            $covoiturage->setHeureArrivee(new DateTimeImmutable()); 
            $covoiturage->setLieuDepart('Toulouse');
            $covoiturage->setLieuArrivee('Bordeaux'); 
            $covoiturage->setNbPlace(4); 
            $covoiturage->setPrixPersonne(10.0); 
            $covoiturage->setStatus('disponible'); 
            $covoiturage->setVoiture($voiture); // 

            $this->manager->persist($covoiturage);
            $this->manager->flush();

        } catch (\Exception $e) {
            // En cas d'erreur lors du flush ou autre, renvoyer une erreur claire
            // Et SURTOUT regarder les logs (var/log/dev.log) pour le détail !
            return $this->json(
                ['error' => 'Erreur lors de la création du covoiturage: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR // Ou HTTP_BAD_REQUEST si c'est une erreur de données
            );
        }


        return $this->json(
            // Il est préférable de renvoyer l'objet créé ou au moins son ID
            // ['message' => "Covoiturage resource created with id {$covoiturage->getId()}"]
            [
                'message' => 'Covoiturage créé avec succès.',
                'covoiturage_id' => $covoiturage->getId()
                // Vous pourriez même sérialiser $covoiturage ici si vous avez un Serializer
            ],
            Response::HTTP_CREATED,
            // Optionnel: Ajouter un header Location vers la ressource créée
            ['Location' => $this->generateUrl('app_api_covoiturage_show', ['id' => $covoiturage->getId()])]
        );
    }

    #[Route('/show/{id}', name: 'show', methods: ['GET'])]
    public function show(int $id): Response
    {
        // Utiliser le ParamConverter est plus idiomatique dans Symfony si possible
        // Mais votre approche fonctionne aussi.
        $covoiturage = $this->repository->find($id); // find() est plus simple que findOneBy(['id' => $id])

        if (!$covoiturage) {
            // Pas besoin de message personnalisé, createNotFoundException le fait.
            throw $this->createNotFoundException("Covoiturage non trouvé pour l'ID: {$id}");
        }

        // Renvoyer plus d'infos ou utiliser la sérialisation pour une vraie API
        return $this->json([
            'id' => $covoiturage->getId(),
            'lieuDepart' => $covoiturage->getLieuDepart(), // Nom de getter correct
            'lieuArrivee' => $covoiturage->getLieuArrivee(), // Nom de getter correct
            'dateDepart' => $covoiturage->getDateDepart() ? $covoiturage->getDateDepart()->format('Y-m-d') : null, // Formater les dates
            'heureDepart' => $covoiturage->getHeureDepart() ? $covoiturage->getHeureDepart()->format('H:i:s') : null, // Formater les heures
            'prixPersonne' => $covoiturage->getPrixPersonne(),
            'nbPlace' => $covoiturage->getNbPlace(),
            'statut' => $covoiturage->getStatut(), // Nom de getter correct
            'voitureInfo' => $covoiturage->getVoiture() ? $covoiturage->getVoiture()->getModele() : null // Exemple d'info relation
        ]);
    }

    #[Route('/edit/{id}', name: 'edit', methods: ['PUT'])] // PUT ou PATCH selon la sémantique voulue
    public function edit(int $id /*, Request $request */ ): Response // Vous aurez besoin de Request pour récupérer les données à mettre à jour
    {
         // Pour une vraie API PUT/PATCH, vous devriez :
         // 1. Récupérer les données du corps de la requête (ex: $request->getContent())
         // 2. Désérialiser ces données (JSON vers un tableau ou un objet)
         // 3. Récupérer l'entité $covoiturage
         // 4. Mettre à jour SEULEMENT les champs fournis dans la requête
         // 5. manager->flush()

        $covoiturage = $this->repository->find($id);

        if (!$covoiturage) {
            throw $this->createNotFoundException("Covoiturage non trouvé pour l'ID: {$id}");
        }

        // Ceci est juste un test simple, pas une vraie mise à jour API
        $covoiturage->setLieuDepart('Updated Toulouse - ' . date('H:i:s')); // Mettre à jour avec la bonne casse

        try {
            $this->manager->flush();
        } catch (\Exception $e) {
             return $this->json(
                ['error' => 'Erreur lors de la mise à jour du covoiturage: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        // Renvoyer l'objet mis à jour ou juste un message succès
        return $this->json([
            'message' => "Covoiturage mis à jour",
            'covoiturage' => [ // Renvoyer l'état mis à jour est une bonne pratique
                 'id' => $covoiturage->getId(),
                 'lieuDepart' => $covoiturage->getLieuDepart(),
                 // ... autres champs ...
             ]
            ]);
    }

    #[Route('/delete/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $covoiturage = $this->repository->find($id);

        if (!$covoiturage) {
             // On peut renvoyer 204 même si ça n'existe pas (idempotence de DELETE)
             // ou 404 si on préfère être strict.
            throw $this->createNotFoundException("Covoiturage non trouvé pour l'ID: {$id}");
        }

         try {
            $this->manager->remove($covoiturage);
            $this->manager->flush();
         } catch (\Exception $e) {
             return $this->json(
                ['error' => 'Erreur lors de la suppression du covoiturage: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
         }


        // HTTP 204 No Content est la réponse standard pour un DELETE réussi sans corps de réponse
        return new Response(null, Response::HTTP_NO_CONTENT);
        // Ou si vous préférez renvoyer un message :
        // return $this->json(['message' => "Covoiturage supprimé"]); // Status 200 OK par défaut
    }
}
