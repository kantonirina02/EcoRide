<?php

namespace App\Controller\Admin;

use App\Entity\Voiture;
use App\Form\VoitureType;
use App\Repository\VoitureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin/voiture')]
#[IsGranted('ROLE_ADMIN')]
final class VoitureController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private VoitureRepository $repository,
    ) {
    }

    #[Route('/', name: 'admin_voiture_index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('voiture/index.html.twig', [
            'voitures' => $this->repository->findAll(),
        ]);
    }

    #[Route('/new', name: 'admin_voiture_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $voiture = new Voiture();
        $form = $this->createForm(VoitureType::class, $voiture);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->entityManager->persist($voiture);
            $this->entityManager->flush();

            $this->addFlash('success', 'Véhicule créé avec succès.');
            return $this->redirectToRoute('admin_voiture_index');
        }

        return $this->render('voiture/new.html.twig', [
            'voiture' => $voiture,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'admin_voiture_show', methods: ['GET'])]
    public function show(Voiture $voiture): Response
    {
        return $this->render('voiture/show.html.twig', [
            'voiture' => $voiture,
        ]);
    }

    #[Route('/{id}/edit', name: 'admin_voiture_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Voiture $voiture): Response
    {
        $form = $this->createForm(VoitureType::class, $voiture);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->entityManager->flush();

            $this->addFlash('success', 'Véhicule mis à jour avec succès.');
            return $this->redirectToRoute('admin_voiture_index');
        }

        return $this->render('voiture/edit.html.twig', [
            'voiture' => $voiture,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'admin_voiture_delete', methods: ['POST'])]
    public function delete(Request $request, Voiture $voiture): Response
    {
        if ($this->isCsrfTokenValid('delete'.$voiture->getId(), $request->request->get('_token'))) {
            $this->entityManager->remove($voiture);
            $this->entityManager->flush();
            $this->addFlash('success', 'Véhicule supprimé avec succès.');
        } else {
            $this->addFlash('error', 'Token CSRF invalide.');
        }

        return $this->redirectToRoute('admin_voiture_index');
    }
}
