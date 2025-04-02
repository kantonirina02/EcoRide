<?php
// src/Controller/AvisController.php

namespace App\Controller; // Namespace changé

use App\Entity\Avis;
use App\Repository\AvisRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
// use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/avis')] // Préfixe /admin/ enlevé
// #[IsGranted('ROLE_EMPLOYE')] // Sécurité toujours recommandée ici
class AvisController extends AbstractController
{
    // ... (Constantes STATUT_* identiques)
    public const STATUT_APPROUVE = 'Approuvé';
    public const STATUT_REJETE = 'Rejeté';
    public const STATUT_EN_ATTENTE = 'En attente';

    #[Route('/', name: 'avis_index', methods: ['GET'])] // Nom de route changé
    public function index(AvisRepository $avisRepository, Request $request): Response
    {
        // ... (logique de filtrage identique)
        $statutFilter = $request->query->get('statut');
        $criteria = $statutFilter ? ['statut' => $statutFilter] : [];

        return $this->render('avis/index.html.twig', [ // Chemin template changé
            'avisList' => $avisRepository->findBy($criteria, ['id' => 'DESC']),
            'currentStatut' => $statutFilter,
            'statutsPossibles' => [self::STATUT_EN_ATTENTE, self::STATUT_APPROUVE, self::STATUT_REJETE],
        ]);
    }

    #[Route('/{id}', name: 'avis_show', methods: ['GET'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function show(Avis $avis): Response
    {
        return $this->render('avis/show.html.twig', [ // Chemin template changé
            'avis' => $avis,
        ]);
    }

    #[Route('/{id}/update-status', name: 'avis_update_status', methods: ['POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function updateStatus(Request $request, Avis $avis, EntityManagerInterface $entityManager): Response
    {
         // ... (logique de mise à jour identique)
        $newStatus = $request->request->get('new_status');
        $token = $request->request->get('_token');

        if (!$this->isCsrfTokenValid('update_status'.$avis->getId(), $token)) {
             $this->addFlash('error', 'Token CSRF invalide.');
             // Nom de route changé dans la redirection
             return $this->redirectToRoute('avis_show', ['id' => $avis->getId()], Response::HTTP_SEE_OTHER);
        }

        if (in_array($newStatus, [self::STATUT_APPROUVE, self::STATUT_REJETE, self::STATUT_EN_ATTENTE])) {
            $avis->setStatut($newStatus);
            $entityManager->flush();
            $this->addFlash('success', 'Statut de l\'avis mis à jour.');
        } else {
            $this->addFlash('error', 'Statut invalide fourni.');
        }
        // Nom de route changé dans la redirection
        return $this->redirectToRoute('avis_show', ['id' => $avis->getId()], Response::HTTP_SEE_OTHER);
    }


    #[Route('/{id}', name: 'avis_delete', methods: ['POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function delete(Request $request, Avis $avis, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$avis->getId(), $request->request->get('_token'))) {
            $entityManager->remove($avis);
            $entityManager->flush();
            $this->addFlash('success', 'Avis supprimé avec succès.');
            // Nom de route changé dans la redirection
             return $this->redirectToRoute('avis_index', [], Response::HTTP_SEE_OTHER);
        } else {
             $this->addFlash('error', 'Token CSRF invalide.');
             // Nom de route changé dans la redirection
              return $this->redirectToRoute('avis_show', ['id' => $avis->getId()], Response::HTTP_SEE_OTHER);
        }
    }
}
