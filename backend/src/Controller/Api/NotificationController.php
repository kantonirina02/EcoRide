<?php

namespace App\Controller\Api;

use App\Entity\Notification;
use App\Entity\Utilisateur;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/notifications', name: 'api_notification_')]
#[IsGranted('ROLE_USER')]
class NotificationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private NotificationRepository $notificationRepository
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(#[CurrentUser] Utilisateur $user, Request $request): JsonResponse
    {
        $limit = $request->query->getInt('limit', 20);
        $offset = $request->query->getInt('offset', 0);
        $onlyUnread = $request->query->getBoolean('unread', false);

        if ($onlyUnread) {
            $notifications = $this->notificationRepository->findUnreadByUtilisateur($user, $limit);
        } else {
            $notifications = $this->notificationRepository->findByUtilisateur($user, $limit);
        }

        $data = [];
        foreach ($notifications as $notification) {
            $data[] = $this->serializeNotification($notification);
        }

        return $this->json([
            'notifications' => $data,
            'total' => count($data),
            'unread_count' => $this->notificationRepository->countUnreadByUtilisateur($user)
        ]);
    }

    #[Route('/unread-count', name: 'unread_count', methods: ['GET'])]
    public function unreadCount(#[CurrentUser] Utilisateur $user): JsonResponse
    {
        return $this->json([
            'unread_count' => $this->notificationRepository->countUnreadByUtilisateur($user)
        ]);
    }

    #[Route('/{id}/read', name: 'mark_read', methods: ['POST'])]
    public function markAsRead(Notification $notification, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        // Vérifier que la notification appartient à l'utilisateur
        if ($notification->getDestinataire() !== $user) {
            return $this->json([
                'error' => 'Non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }

        if (!$notification->isLu()) {
            $notification->setLu(true);
            $this->entityManager->flush();
        }

        return $this->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $this->serializeNotification($notification)
        ]);
    }

    #[Route('/mark-all-read', name: 'mark_all_read', methods: ['POST'])]
    public function markAllAsRead(#[CurrentUser] Utilisateur $user): JsonResponse
    {
        $count = $this->notificationRepository->markAllAsReadByUtilisateur($user);

        return $this->json([
            'message' => sprintf('%d notifications marquées comme lues', $count),
            'marked_count' => $count
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Notification $notification, #[CurrentUser] Utilisateur $user): JsonResponse
    {
        // Vérifier que la notification appartient à l'utilisateur
        if ($notification->getDestinataire() !== $user) {
            return $this->json([
                'error' => 'Non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($notification);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Notification supprimée'
        ], Response::HTTP_NO_CONTENT);
    }

    #[Route('/bulk-delete', name: 'bulk_delete', methods: ['DELETE'])]
    public function bulkDelete(#[CurrentUser] Utilisateur $user, Request $request): JsonResponse
    {
        $ids = $request->request->all('ids');

        if (empty($ids)) {
            return $this->json([
                'error' => 'Aucune notification spécifiée'
            ], Response::HTTP_BAD_REQUEST);
        }

        $deletedCount = 0;
        foreach ($ids as $id) {
            $notification = $this->notificationRepository->find($id);

            if ($notification && $notification->getDestinataire() === $user) {
                $this->entityManager->remove($notification);
                $deletedCount++;
            }
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => sprintf('%d notifications supprimées', $deletedCount),
            'deleted_count' => $deletedCount
        ]);
    }

    private function serializeNotification(Notification $notification): array
    {
        return [
            'id' => $notification->getId(),
            'titre' => $notification->getTitre(),
            'message' => $notification->getMessage(),
            'type' => $notification->getType(),
            'data' => $notification->getData(),
            'lu' => $notification->isLu(),
            'date_creation' => $notification->getDateCreation()->format('Y-m-d H:i:s')
        ];
    }
}
