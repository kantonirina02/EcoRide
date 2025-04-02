<?php

namespace App\Controller; // Namespace changé

use App\Entity\Marque;
use App\Form\MarqueType;
use App\Repository\MarqueRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
// use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/marque')] // Préfixe /admin/ enlevé
// #[IsGranted('ROLE_ADMIN')] // Sécurité toujours recommandée ici
class MarqueController extends AbstractController
{
    #[Route('/', name: 'marque_index', methods: ['GET'])] // Nom de route changé
    public function index(MarqueRepository $marqueRepository): Response
    {
        return $this->render('marque/index.html.twig', [ // Chemin template changé
            'marques' => $marqueRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'marque_new', methods: ['GET', 'POST'])] // Nom de route changé
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $marque = new Marque();
        $form = $this->createForm(MarqueType::class, $marque);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($marque);
            $entityManager->flush();

            $this->addFlash('success', 'Marque créée avec succès.');
             // Nom de route changé dans la redirection
            return $this->redirectToRoute('marque_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('marque/new.html.twig', [ // Chemin template changé
            'marque' => $marque,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'marque_show', methods: ['GET'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function show(Marque $marque): Response
    {
        return $this->render('marque/show.html.twig', [ // Chemin template changé
            'marque' => $marque,
        ]);
    }

    #[Route('/{id}/edit', name: 'marque_edit', methods: ['GET', 'POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function edit(Request $request, Marque $marque, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(MarqueType::class, $marque);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            $this->addFlash('success', 'Marque mise à jour avec succès.');
             // Nom de route changé dans la redirection
            return $this->redirectToRoute('marque_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('marque/edit.html.twig', [ // Chemin template changé
            'marque' => $marque,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'marque_delete', methods: ['POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function delete(Request $request, Marque $marque, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$marque->getId(), $request->request->get('_token'))) {
             // ... (logique de suppression identique avec vérification des voitures)
            if ($marque->getVoitures()->isEmpty()) {
                 $entityManager->remove($marque);
                 $entityManager->flush();
                 $this->addFlash('success', 'Marque supprimée avec succès.');
            } else {
                 $this->addFlash('error', 'Impossible de supprimer la marque, elle est utilisée par des voitures.');
            }
        } else {
             $this->addFlash('error', 'Token CSRF invalide.');
        }
         // Nom de route changé dans la redirection
        return $this->redirectToRoute('marque_index', [], Response::HTTP_SEE_OTHER);
    }
}
