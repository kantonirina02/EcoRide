<?php

namespace App\Controller\Admin;

use App\Entity\Avis;
use App\Form\AvisType;
use App\Repository\AvisRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin/avis')]
#[IsGranted('ROLE_ADMIN')]
final class AvisController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private AvisRepository $repository,
    ) {
    }

    #[Route('/', name: 'admin_avis_index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('avis/index.html.twig', [
            'avis' => $this->repository->findAll(),
        ]);
    }

    #[Route('/new', name: 'admin_avis_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $avi = new Avis();
        $form = $this->createForm(AvisType::class, $avi);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->entityManager->persist($avi);
            $this->entityManager->flush();

            $this->addFlash('success', 'Avis créé avec succès.');
            return $this->redirectToRoute('admin_avis_index');
        }

        return $this->render('avis/new.html.twig', [
            'avi' => $avi,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'admin_avis_show', methods: ['GET'])]
    public function show(Avis $avi): Response
    {
        return $this->render('avis/show.html.twig', [
            'avis' => $avi,
        ]);
    }

    #[Route('/{id}/edit', name: 'admin_avis_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Avis $avi): Response
    {
        $form = $this->createForm(AvisType::class, $avi);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->entityManager->flush();

            $this->addFlash('success', 'Avis mis à jour avec succès.');
            return $this->redirectToRoute('admin_avis_index');
        }

        return $this->render('avis/edit.html.twig', [
            'avis' => $avi,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'admin_avis_delete', methods: ['POST'])]
    public function delete(Request $request, Avis $avi): Response
    {
        if ($this->isCsrfTokenValid('delete'.$avi->getId(), $request->request->get('_token'))) {
            $this->entityManager->remove($avi);
            $this->entityManager->flush();
            $this->addFlash('success', 'Avis supprimé avec succès.');
        } else {
            $this->addFlash('error', 'Token CSRF invalide.');
        }

        return $this->redirectToRoute('admin_avis_index');
    }

    #[Route('/{id}/approve', name: 'admin_avis_approve', methods: ['POST'])]
    public function approve(Request $request, Avis $avi): Response
    {
        if ($this->isCsrfTokenValid('approve'.$avi->getId(), $request->request->get('_token'))) {
            $avi->setStatut('approuve');
            $this->entityManager->flush();
            $this->addFlash('success', 'Avis approuvé avec succès.');
        } else {
            $this->addFlash('error', 'Token CSRF invalide.');
        }

        return $this->redirectToRoute('admin_avis_index');
    }

    #[Route('/{id}/reject', name: 'admin_avis_reject', methods: ['POST'])]
    public function reject(Request $request, Avis $avi): Response
    {
        if ($this->isCsrfTokenValid('reject'.$avi->getId(), $request->request->get('_token'))) {
            $avi->setStatut('rejete');
            $this->entityManager->flush();
            $this->addFlash('success', 'Avis rejeté.');
        } else {
            $this->addFlash('error', 'Token CSRF invalide.');
        }

        return $this->redirectToRoute('admin_avis_index');
    }
}
