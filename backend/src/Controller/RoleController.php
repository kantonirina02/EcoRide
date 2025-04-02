<?php
namespace App\Controller; // Namespace changé

use App\Entity\Role;
use App\Form\RoleType;
use App\Repository\RoleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
// use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/role')] 
// #[IsGranted('ROLE_ADMIN')] // Sécurité toujours recommandée ici
class RoleController extends AbstractController
{
    #[Route('/', name: 'role_index', methods: ['GET'])] // Nom de route changé
    public function index(RoleRepository $roleRepository): Response
    {
        return $this->render('role/index.html.twig', [ // Chemin template changé
            'roles' => $roleRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'role_new', methods: ['GET', 'POST'])] // Nom de route changé
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $role = new Role();
        $form = $this->createForm(RoleType::class, $role);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($role);
            $entityManager->flush();

            $this->addFlash('success', 'Rôle créé avec succès.');
            // Nom de route changé dans la redirection
            return $this->redirectToRoute('role_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('role/new.html.twig', [ // Chemin template changé
            'role' => $role,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'role_show', methods: ['GET'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function show(Role $role): Response
    {
        return $this->render('role/show.html.twig', [ // Chemin template changé
            'role' => $role,
        ]);
    }

    #[Route('/{id}/edit', name: 'role_edit', methods: ['GET', 'POST'], requirements: ['id' => '\d+'])] // Nom de route changé
    public function edit(Request $request, Role $role, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(RoleType::class, $role);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            $this->addFlash('success', 'Rôle mis à jour avec succès.');
             // Nom de route changé dans la redirection
            return $this->redirectToRoute('role_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('role/edit.html.twig', [ // Chemin template changé
            'role' => $role,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'role_delete', methods: ['POST'], requirements: ['id' => '\d+'])] // Nom de route changé
     public function delete(Request $request, Role $role, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$role->getId(), $request->request->get('_token'))) {
            $entityManager->remove($role);
            $entityManager->flush();
            $this->addFlash('success', 'Rôle supprimé avec succès.');
        } else {
             $this->addFlash('error', 'Token CSRF invalide.');
        }
        // Nom de route changé dans la redirection
        return $this->redirectToRoute('role_index', [], Response::HTTP_SEE_OTHER);
    }
}
