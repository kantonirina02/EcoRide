<?php

namespace App\Controller; // Namespace changé

use App\Entity\Utilisateur;
use App\Form\UtilisateurType;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
// use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/utilisateur')] // Préfixe /admin/ enlevé
// #[IsGranted('ROLE_ADMIN')] // Sécurité toujours recommandée ici
class UtilisateurController extends AbstractController
{
    #[Route('/', name: 'utilisateur_index', methods: ['GET'])] // Nom de route changé
    public function index(UtilisateurRepository $utilisateurRepository): Response
    {
        return $this->render('utilisateur/index.html.twig', [ // Chemin template changé
            'utilisateurs' => $utilisateurRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'utilisateur_new', methods: ['GET', 'POST'])] // Nom de route changé
    public function new(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): Response
    {
        $utilisateur = new Utilisateur();
        $form = $this->createForm(UtilisateurType::class, $utilisateur);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // ... (logique de hachage et persistance identique)
            $hashedPassword = $passwordHasher->hashPassword(
                $utilisateur,
                $form->get('plainPassword')->getData()
            );
            $utilisateur->setPassword($hashedPassword);

            $entityManager->persist($utilisateur);
            $entityManager->flush();

            $this->addFlash('success', 'Utilisateur créé avec succès.');
            // Nom de route changé dans la redirection
            return $this->redirectToRoute('utilisateur_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('utilisateur/new.html.twig', [ // Chemin template changé
            'utilisateur' => $utilisateur,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'utilisateur_show', methods: ['GET'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function show(Utilisateur $utilisateur): Response
    {
        return $this->render('utilisateur/show.html.twig', [ // Chemin template changé
            'utilisateur' => $utilisateur,
        ]);
    }

    #[Route('/{id}/edit', name: 'utilisateur_edit', methods: ['GET', 'POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function edit(Request $request, Utilisateur $utilisateur, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): Response
    {
        $form = $this->createForm(UtilisateurType::class, $utilisateur);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
             // ... (logique de hachage optionnel et persistance identique)
             $plainPassword = $form->get('plainPassword')->getData();
             if ($plainPassword) {
                 $hashedPassword = $passwordHasher->hashPassword($utilisateur, $plainPassword);
                 $utilisateur->setPassword($hashedPassword);
             }

            $entityManager->flush();

            $this->addFlash('success', 'Utilisateur mis à jour avec succès.');
             // Nom de route changé dans la redirection
            return $this->redirectToRoute('utilisateur_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('utilisateur/edit.html.twig', [ // Chemin template changé
            'utilisateur' => $utilisateur,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'utilisateur_delete', methods: ['POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function delete(Request $request, Utilisateur $utilisateur, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$utilisateur->getId(), $request->request->get('_token'))) {
            // ... (logique de suppression identique)
            $entityManager->remove($utilisateur);
            $entityManager->flush();
            $this->addFlash('success', 'Utilisateur supprimé avec succès.');
        } else {
            $this->addFlash('error', 'Token CSRF invalide.');
        }
         // Nom de route changé dans la redirection
        return $this->redirectToRoute('utilisateur_index', [], Response::HTTP_SEE_OTHER);
    }

    #[Route('/{id}/suspend', name: 'utilisateur_suspend', methods: ['POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function suspend(Request $request, Utilisateur $utilisateur, EntityManagerInterface $entityManager): Response
    {
         if ($this->isCsrfTokenValid('suspend'.$utilisateur->getId(), $request->request->get('_token'))) {
            // ... (logique de suspension à implémenter identique)
             $this->addFlash('warning', 'Logique de suspension non implémentée.');
        } else {
             $this->addFlash('error', 'Token CSRF invalide.');
        }
        // Nom de route changé dans la redirection
        return $this->redirectToRoute('utilisateur_show', ['id' => $utilisateur->getId()], Response::HTTP_SEE_OTHER);
    }
}
