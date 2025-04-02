<?php
// src/Controller/ConfigurationController.php

namespace App\Controller; // Namespace changé

use App\Entity\Configuration;
use App\Form\ConfigurationType;
use App\Repository\ConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
// use Symfony\Component\Security\Http\Attribute\IsGranted;


#[Route('/configuration')] // Préfixe /admin/ enlevé
// #[IsGranted('ROLE_SUPER_ADMIN')] // Sécurité toujours recommandée ici
class ConfigurationController extends AbstractController
{
    #[Route('/', name: 'configuration_index', methods: ['GET'])] // Nom de route changé
    public function index(ConfigurationRepository $configurationRepository): Response
    {
        return $this->render('configuration/index.html.twig', [ // Chemin template changé
            'configurations' => $configurationRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'configuration_new', methods: ['GET', 'POST'])] // Nom de route changé
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $configuration = new Configuration();
        $form = $this->createForm(ConfigurationType::class, $configuration);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($configuration);
            $entityManager->flush();
            // Nom de route changé dans la redirection
            return $this->redirectToRoute('configuration_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('configuration/new.html.twig', [ // Chemin template changé
            'configuration' => $configuration,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'configuration_show', methods: ['GET'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function show(Configuration $configuration): Response
    {
        return $this->render('configuration/show.html.twig', [ // Chemin template changé
            'configuration' => $configuration,
        ]);
    }

    #[Route('/{id}/edit', name: 'configuration_edit', methods: ['GET', 'POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function edit(Request $request, Configuration $configuration, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(ConfigurationType::class, $configuration);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();
            // Nom de route changé dans la redirection
            return $this->redirectToRoute('configuration_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('configuration/edit.html.twig', [ // Chemin template changé
            'configuration' => $configuration,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'configuration_delete', methods: ['POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function delete(Request $request, Configuration $configuration, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$configuration->getId(), $request->request->get('_token'))) {
            // ... (logique de suppression identique avec vérification des paramètres)
             if ($configuration->getParametres()->isEmpty()) {
                $entityManager->remove($configuration);
                $entityManager->flush();
                $this->addFlash('success', 'Configuration supprimée.');
             } else {
                 $this->addFlash('error', 'Configuration liée à des paramètres.');
             }
        } else {
             $this->addFlash('error', 'Token CSRF invalide.');
        }
        // Nom de route changé dans la redirection
        return $this->redirectToRoute('configuration_index', [], Response::HTTP_SEE_OTHER);
    }
}
