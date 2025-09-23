<?php

namespace App\Controller\Admin;

use App\Entity\Covoiturage;
use App\Form\CovoiturageType;
use App\Repository\CovoiturageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin/covoiturage')]
#[IsGranted('ROLE_ADMIN')]
final class CovoiturageController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CovoiturageRepository $repository,
    ) {
    }

    #[Route('/', name: 'admin_covoiturage_index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('covoiturage/index.html.twig', [
            'covoiturages' => $this->repository->findAll(),
        ]);
    }

    #[Route('/new', name: 'admin_covoiturage_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $covoiturage = new Covoiturage();
        $form = $this->createForm(CovoiturageType::class, $covoiturage);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->entityManager->persist($covoiturage);
            $this->entityManager->flush();

            $this->addFlash('success', 'Covoiturage créé avec succès.');
            return $this->redirectToRoute('admin_covoiturage_index');
        }

        return $this->render('covoiturage/new.html.twig', [
            'covoiturage' => $covoiturage,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'admin_covoiturage_show', methods: ['GET'])]
    public function show(Covoiturage $covoiturage): Response
    {
        return $this->render('covoiturage/show.html.twig', [
            'covoiturage' => $covoiturage,
        ]);
    }

    #[Route('/{id}/edit', name: 'admin_covoiturage_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Covoiturage $covoiturage): Response
    {
        $form = $this->createForm(CovoiturageType::class, $covoiturage);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->entityManager->flush();

            $this->addFlash('success', 'Covoiturage mis à jour avec succès.');
            return $this->redirectToRoute('admin_covoiturage_index');
        }

        return $this->render('covoiturage/edit.html.twig', [
            'covoiturage' => $covoiturage,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'admin_covoiturage_delete', methods: ['POST'])]
    public function delete(Request $request, Covoiturage $covoiturage): Response
    {
        if ($this->isCsrfTokenValid('delete'.$covoiturage->getId(), $request->request->get('_token'))) {
            $this->entityManager->remove($covoiturage);
            $this->entityManager->flush();
            $this->addFlash('success', 'Covoiturage supprimé avec succès.');
        } else {
            $this->addFlash('error', 'Token CSRF invalide.');
        }

        return $this->redirectToRoute('admin_covoiturage_index');
    }
}
