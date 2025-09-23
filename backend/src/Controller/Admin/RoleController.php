<?php

namespace App\Controller\Admin;

use App\Entity\Role;
use App\Entity\Utilisateur;
use App\Form\RoleType;
use App\Repository\RoleRepository;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin/role')]
#[IsGranted('ROLE_ADMIN')]
final class RoleController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private RoleRepository $roleRepository,
        private UtilisateurRepository $utilisateurRepository,
    ) {
    }

    #[Route('/', name: 'admin_role_index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('role/index.html.twig', [
            'roles' => $this->roleRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'admin_role_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        $role = new Role();
        $form = $this->createForm(RoleType::class, $role);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Vérifier que le libellé n'existe pas déjà
            $existingRole = $this->roleRepository->findOneBy(['libelle' => $role->getLibelle()]);
            if ($existingRole) {
                $this->addFlash('error', 'Ce rôle existe déjà.');
                return $this->redirectToRoute('admin_role_new');
            }

            $this->entityManager->persist($role);
            $this->entityManager->flush();

            $this->addFlash('success', 'Rôle créé avec succès.');
            return $this->redirectToRoute('admin_role_index');
        }

        return $this->render('role/new.html.twig', [
            'role' => $role,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'admin_role_show', methods: ['GET'])]
    public function show(Role $role): Response
    {
        return $this->render('role/show.html.twig', [
            'role' => $role,
        ]);
    }

    #[Route('/{id}/edit', name: 'admin_role_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Role $role): Response
    {
        $form = $this->createForm(RoleType::class, $role);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Vérifier que le libellé n'existe pas déjà pour un autre rôle
            $existingRole = $this->roleRepository->findOneBy(['libelle' => $role->getLibelle()]);
            if ($existingRole && $existingRole->getId() !== $role->getId()) {
                $this->addFlash('error', 'Ce libellé de rôle existe déjà.');
                return $this->redirectToRoute('admin_role_edit', ['id' => $role->getId()]);
            }

            $this->entityManager->flush();

            $this->addFlash('success', 'Rôle mis à jour avec succès.');
            return $this->redirectToRoute('admin_role_index');
        }

        return $this->render('role/edit.html.twig', [
            'role' => $role,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'admin_role_delete', methods: ['POST'])]
    public function delete(Request $request, Role $role): Response
    {
        if ($this->isCsrfTokenValid('delete'.$role->getId(), $request->request->get('_token'))) {
            // Vérifier que le rôle n'est pas utilisé par des utilisateurs
            if ($role->getUtilisateurs()->count() > 0) {
                $this->addFlash('error', 'Impossible de supprimer ce rôle car il est assigné à des utilisateurs.');
            } else {
                $this->entityManager->remove($role);
                $this->entityManager->flush();
                $this->addFlash('success', 'Rôle supprimé avec succès.');
            }
        } else {
            $this->addFlash('error', 'Token CSRF invalide.');
        }

        return $this->redirectToRoute('admin_role_index');
    }

    #[Route('/{id}/assign', name: 'admin_role_assign', methods: ['GET', 'POST'])]
    public function assign(Request $request, Role $role): Response
    {
        if ($request->isMethod('POST')) {
            $userId = $request->request->get('user_id');

            if (!$userId) {
                $this->addFlash('error', 'Utilisateur non spécifié.');
                return $this->redirectToRoute('admin_role_assign', ['id' => $role->getId()]);
            }

            $utilisateur = $this->utilisateurRepository->find($userId);
            if (!$utilisateur) {
                $this->addFlash('error', 'Utilisateur non trouvé.');
                return $this->redirectToRoute('admin_role_assign', ['id' => $role->getId()]);
            }

            // Vérifier si l'utilisateur a déjà ce rôle
            if (!$utilisateur->getRolesCollection()->contains($role)) {
                $utilisateur->addRole($role);
                $this->entityManager->flush();
                $this->addFlash('success', 'Rôle assigné avec succès à l\'utilisateur.');
            } else {
                $this->addFlash('warning', 'L\'utilisateur possède déjà ce rôle.');
            }

            return $this->redirectToRoute('admin_role_show', ['id' => $role->getId()]);
        }

        return $this->render('role/assign.html.twig', [
            'role' => $role,
            'utilisateurs' => $this->utilisateurRepository->findAll(),
        ]);
    }

    #[Route('/{id}/remove-user/{userId}', name: 'admin_role_remove_user', methods: ['POST'])]
    public function removeUser(Request $request, Role $role, int $userId): Response
    {
        if (!$this->isCsrfTokenValid('remove_user'.$userId, $request->request->get('_token'))) {
            $this->addFlash('error', 'Token CSRF invalide.');
            return $this->redirectToRoute('admin_role_show', ['id' => $role->getId()]);
        }

        $utilisateur = $this->utilisateurRepository->find($userId);
        if (!$utilisateur) {
            $this->addFlash('error', 'Utilisateur non trouvé.');
            return $this->redirectToRoute('admin_role_show', ['id' => $role->getId()]);
        }

        if ($utilisateur->getRolesCollection()->contains($role)) {
            $utilisateur->removeRole($role);
            $this->entityManager->flush();
            $this->addFlash('success', 'Rôle retiré de l\'utilisateur avec succès.');
        } else {
            $this->addFlash('warning', 'L\'utilisateur ne possède pas ce rôle.');
        }

        return $this->redirectToRoute('admin_role_show', ['id' => $role->getId()]);
    }
}
