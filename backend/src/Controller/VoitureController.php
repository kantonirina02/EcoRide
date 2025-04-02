<?php

namespace App\Controller;

use App\Entity\Marque;
use App\Entity\Voiture;
use App\Form\VoitureType; // Si tu l'utilises (non utilisé dans la version API)
use App\Repository\MarqueRepository;
use App\Repository\VoitureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted; // <--- Pour #[IsGranted]
use Symfony\Component\Serializer\SerializerInterface;     // <--- Pour l'injection et les exceptions
use Symfony\Component\Serializer\Exception\NotEncodableValueException; 

#[Route('/api/voitures', name: 'app_api_voiture_')]
// #[IsGranted('ROLE_USER')] // Exemple de protection globale (à affiner)
class VoitureController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $manager,
        private VoitureRepository $repository,
        private MarqueRepository $marqueRepository // Injecter pour créer/lier la marque
    ) {
    }

    /**
     * READ (List) - Lister les voitures de l'utilisateur connecté
     */
    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')] // Seul un utilisateur connecté peut voir ses voitures
    public function list(): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupère seulement les voitures liées à l'utilisateur courant
        $voitures = $this->repository->findBy(['proprietaire' => $user]);

        // Utiliser la sérialisation pour une meilleure réponse API
        return $this->json($voitures, Response::HTTP_OK, [], ['groups' => 'voiture:read']); // Ajouter des groupes de sérialisation à l'entité
    }

    /**
     * CREATE - Ajouter une nouvelle voiture pour l'utilisateur connecté
     */
    #[Route('', name: 'new', methods: ['POST'])]
    #[IsGranted('ROLE_USER')] // Seul un utilisateur connecté peut ajouter une voiture
    public function new(Request $request, SerializerInterface $serializer): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            // Désérialiser le JSON reçu dans un nouvel objet Voiture
            // Assurez-vous que les groupes de sérialisation sont bien définis dans l'entité
            $voiture = $serializer->deserialize($request->getContent(), Voiture::class, 'json', ['groups' => 'voiture:write']);

            // Lier la voiture à l'utilisateur connecté
            $voiture->setProprietaire($user); // Assurez-vous que setProprietaire existe

            // Gérer la relation Marque (exemple simple : recherche par libellé)
            // Dans une vraie API, vous recevriez l'ID de la marque ou son libellé
            $data = json_decode($request->getContent(), true);
            if (isset($data['marque_libelle'])) {
                 $marque = $this->marqueRepository->findOneBy(['libelle' => $data['marque_libelle']]);
                 if (!$marque) {
                     // Optionnel: Créer la marque si elle n'existe pas
                     // $marque = new Marque();
                     // $marque->setLibelle($data['marque_libelle']);
                     // $this->manager->persist($marque);
                     // Ou renvoyer une erreur
                     return $this->json(['error' => 'Marque non trouvée: ' . $data['marque_libelle']], Response::HTTP_BAD_REQUEST);
                 }
                 $voiture->setMarque($marque); // Assurez-vous que setMarque existe
                } else if ($voiture->getMarque() === null) {
                    return $this->json(['error' => 'Marque obligatoire non fournie'], Response::HTTP_BAD_REQUEST);
               }

            // Valider l'entité (si vous utilisez le composant Validator)
            // $errors = $validator->validate($voiture);
            // if (count($errors) > 0) { return $this->json($errors, Response::HTTP_BAD_REQUEST); }


            $this->manager->persist($voiture);
            $this->manager->flush();

            return $this->json($voiture, Response::HTTP_CREATED, [
                'Location' => $this->generateUrl('app_api_voiture_show', ['id' => $voiture->getId()])
            ], ['groups' => 'voiture:read']);

        } catch (\Symfony\Component\Serializer\Exception\NotEncodableValueException $e) {
            return $this->json(['error' => 'JSON mal formé'], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            // Log l'erreur $e->getMessage()
            return $this->json(['error' => 'Erreur serveur lors de la création'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * READ (Show) - Afficher une voiture spécifique de l'utilisateur connecté
     */
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    #[IsGranted('view', 'voiture')] // Exemple de Voter pour vérifier que l'user peut voir CETTE voiture
    public function show(Voiture $voiture): Response // Utilisation du ParamConverter
    {
        // Le Voter (non implémenté ici) vérifierait $voiture->getProprietaire() === $this->getUser()
        // ou si l'utilisateur est admin

        return $this->json($voiture, Response::HTTP_OK, [], ['groups' => 'voiture:read']);
    }


    /**
     * UPDATE - Mettre à jour une voiture spécifique de l'utilisateur connecté
     * Utilise PUT (remplacement complet) ou PATCH (mise à jour partielle)
     */
    #[Route('/{id}', name: 'edit', methods: ['PUT', 'PATCH'])]
    #[IsGranted('edit', 'voiture')] // Exemple de Voter
    public function edit(Voiture $voiture, Request $request, SerializerInterface $serializer): Response
    {
         // Le Voter vérifierait $voiture->getProprietaire() === $this->getUser()

        try {
            // Désérialiser DANS l'objet existant $voiture
            // Le 'object_to_populate' évite de créer une nouvelle instance
            $serializer->deserialize($request->getContent(), Voiture::class, 'json', [
                'object_to_populate' => $voiture,
                'groups' => 'voiture:write'
             ]);

             // Re-gérer la marque si elle est envoyée dans la requête de mise à jour
             $data = json_decode($request->getContent(), true);
             if (isset($data['marque_libelle'])) {
                 $marque = $this->marqueRepository->findOneBy(['libelle' => $data['marque_libelle']]);
                  if (!$marque) {
                      return $this->json(['error' => 'Marque non trouvée: ' . $data['marque_libelle']], Response::HTTP_BAD_REQUEST);
                  }
                  $voiture->setMarque($marque);
             }

            // Valider l'entité mise à jour
            // $errors = $validator->validate($voiture);
            // if (count($errors) > 0) { return $this->json($errors, Response::HTTP_BAD_REQUEST); }

            $this->manager->flush(); // Pas besoin de persist, Doctrine suit déjà l'objet

            return $this->json($voiture, Response::HTTP_OK, [], ['groups' => 'voiture:read']);

        } catch (\Symfony\Component\Serializer\Exception\NotEncodableValueException $e) {
            return $this->json(['error' => 'JSON mal formé'], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            // Log l'erreur $e->getMessage()
            return $this->json(['error' => 'Erreur serveur lors de la mise à jour'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE - Supprimer une voiture spécifique de l'utilisateur connecté
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('delete', 'voiture')] // Exemple de Voter
    public function delete(Voiture $voiture): Response
    {
        // Le Voter vérifierait $voiture->getProprietaire() === $this->getUser()

        try {
            // Vérifier si la voiture est utilisée dans des covoiturages futurs ?
            // if ($voiture->getCovoiturages()->count() > 0) { ... renvoyer erreur ... }

            $this->manager->remove($voiture);
            $this->manager->flush();

            return new Response(null, Response::HTTP_NO_CONTENT);

        } catch (\Exception $e) {
             // Log l'erreur $e->getMessage()
            return $this->json(['error' => 'Erreur serveur lors de la suppression'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
