<?php
// src/Controller/ParametreController.php

namespace App\Controller; // Namespace changé

use App\Entity\Parametre;
use App\Form\ParametreType;
use App\Repository\ParametreRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
// use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/parametre')] // Préfixe /admin/ enlevé
// #[IsGranted('ROLE_SUPER_ADMIN')] // Sécurité toujours recommandée ici
class ParametreController extends AbstractController
{
    #[Route('/', name: 'parametre_index', methods: ['GET'])] // Nom de route changé
    public function index(ParametreRepository $parametreRepository): Response
    {
        return $this->render('parametre/index.html.twig', [ // Chemin template changé
            'parametres' => $parametreRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'parametre_new', methods: ['GET', 'POST'])] // Nom de route changé
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $parametre = new Parametre();
        $form = $this->createForm(ParametreType::class, $parametre);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($parametre);
            $entityManager->flush();
            // Nom de route changé dans la redirection
            return $this->redirectToRoute('parametre_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('parametre/new.html.twig', [ // Chemin template changé
            'parametre' => $parametre,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'parametre_show', methods: ['GET'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function show(Parametre $parametre): Response
    {
        return $this->render('parametre/show.html.twig', [ // Chemin template changé
            'parametre' => $parametre,
        ]);
    }

    #[Route('/{id}/edit', name: 'parametre_edit', methods: ['GET', 'POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function edit(Request $request, Parametre $parametre, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(ParametreType::class, $parametre);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();
            // Nom de route changé dans la redirection
            return $this->redirectToRoute('parametre_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('parametre/edit.html.twig', [ // Chemin template changé
            'parametre' => $parametre,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'parametre_delete', methods: ['POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function delete(Request $request, Parametre $parametre, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$parametre->getId(), $request->request->get('_token'))) {
            $entityManager->remove($parametre);
            $entityManager->flush();
             $this->addFlash('success', 'Paramètre supprimé.');
        } else {
             $this->addFlash('error', 'Token CSRF invalide.');
        }
        // Nom de route changé dans la redirection
        return $this->redirectToRoute('parametre_index', [], Response::HTTP_SEE_OTHER);
    }
}
