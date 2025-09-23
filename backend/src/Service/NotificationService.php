<?php

namespace App\Service;

use App\Entity\Utilisateur;
use App\Entity\Covoiturage;
use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class NotificationService
{
    private EntityManagerInterface $entityManager;
    private Security $security;

    public function __construct(
        EntityManagerInterface $entityManager,
        Security $security
    ) {
        $this->entityManager = $entityManager;
        $this->security = $security;
    }

    /**
     * Créer une notification pour un utilisateur
     */
    public function createNotification(
        Utilisateur $destinataire,
        string $titre,
        string $message,
        string $type = 'info',
        array $data = []
    ): Notification {
        $notification = new Notification();
        $notification->setDestinataire($destinataire);
        $notification->setTitre($titre);
        $notification->setMessage($message);
        $notification->setType($type);
        $notification->setData($data);
        $notification->setDateCreation(new \DateTime());
        $notification->setLu(false);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        return $notification;
    }

    /**
     * Notifier une réservation de covoiturage
     */
    public function notifyReservation(Covoiturage $covoiturage, Utilisateur $passager): void
    {
        $conducteur = $covoiturage->getVoiture()->getUtilisateur();

        // Notification au passager
        $this->createNotification(
            $passager,
            'Réservation confirmée',
            sprintf(
                'Votre réservation pour le covoiturage %s → %s du %s a été confirmée.',
                $covoiturage->getLieuDepart(),
                $covoiturage->getLieuArrivee(),
                $covoiturage->getDateDepart()->format('d/m/Y à H:i')
            ),
            'success',
            [
                'covoiturage_id' => $covoiturage->getId(),
                'conducteur_id' => $conducteur->getId()
            ]
        );

        // Notification au conducteur
        $this->createNotification(
            $conducteur,
            'Nouvelle réservation',
            sprintf(
                '%s %s a réservé une place pour votre covoiturage %s → %s du %s.',
                $passager->getPrenom(),
                $passager->getNom(),
                $covoiturage->getLieuDepart(),
                $covoiturage->getLieuArrivee(),
                $covoiturage->getDateDepart()->format('d/m/Y à H:i')
            ),
            'info',
            [
                'covoiturage_id' => $covoiturage->getId(),
                'passager_id' => $passager->getId()
            ]
        );
    }

    /**
     * Notifier l'annulation d'une réservation
     */
    public function notifyReservationCancelled(Covoiturage $covoiturage, Utilisateur $passager): void
    {
        $conducteur = $covoiturage->getVoiture()->getUtilisateur();

        // Notification au passager
        $this->createNotification(
            $passager,
            'Réservation annulée',
            sprintf(
                'Votre réservation pour le covoiturage %s → %s du %s a été annulée.',
                $covoiturage->getLieuDepart(),
                $covoiturage->getLieuArrivee(),
                $covoiturage->getDateDepart()->format('d/m/Y à H:i')
            ),
            'warning',
            ['covoiturage_id' => $covoiturage->getId()]
        );

        // Notification au conducteur
        $this->createNotification(
            $conducteur,
            'Réservation annulée',
            sprintf(
                '%s %s a annulé sa réservation pour votre covoiturage %s → %s du %s.',
                $passager->getPrenom(),
                $passager->getNom(),
                $covoiturage->getLieuDepart(),
                $covoiturage->getLieuArrivee(),
                $covoiturage->getDateDepart()->format('d/m/Y à H:i')
            ),
            'warning',
            [
                'covoiturage_id' => $covoiturage->getId(),
                'passager_id' => $passager->getId()
            ]
        );
    }

    /**
     * Notifier un nouvel avis
     */
    public function notifyNewReview(Covoiturage $covoiturage, Utilisateur $auteur): void
    {
        $conducteur = $covoiturage->getVoiture()->getUtilisateur();

        $this->createNotification(
            $conducteur,
            'Nouvel avis reçu',
            sprintf(
                '%s %s vous a laissé un avis pour votre covoiturage %s → %s.',
                $auteur->getPrenom(),
                $auteur->getNom(),
                $covoiturage->getLieuDepart(),
                $covoiturage->getLieuArrivee()
            ),
            'info',
            [
                'covoiturage_id' => $covoiturage->getId(),
                'avis_auteur_id' => $auteur->getId()
            ]
        );
    }

    /**
     * Notifier un covoiturage complet
     */
    public function notifyCovoiturageComplet(Covoiturage $covoiturage): void
    {
        $conducteur = $covoiturage->getVoiture()->getUtilisateur();

        $this->createNotification(
            $conducteur,
            'Covoiturage complet',
            sprintf(
                'Votre covoiturage %s → %s du %s est maintenant complet !',
                $covoiturage->getLieuDepart(),
                $covoiturage->getLieuArrivee(),
                $covoiturage->getDateDepart()->format('d/m/Y à H:i')
            ),
            'success',
            ['covoiturage_id' => $covoiturage->getId()]
        );
    }

    /**
     * Notifier un covoiturage annulé
     */
    public function notifyCovoiturageAnnule(Covoiturage $covoiturage): void
    {
        $conducteur = $covoiturage->getVoiture()->getUtilisateur();

        // Notifier tous les passagers
        foreach ($covoiturage->getPassengers() as $passager) {
            $this->createNotification(
                $passager,
                'Covoiturage annulé',
                sprintf(
                    'Le covoiturage %s → %s du %s a été annulé par le conducteur.',
                    $covoiturage->getLieuDepart(),
                    $covoiturage->getLieuArrivee(),
                    $covoiturage->getDateDepart()->format('d/m/Y à H:i')
                ),
                'danger',
                ['covoiturage_id' => $covoiturage->getId()]
            );
        }

        // Notifier le conducteur (confirmation)
        $this->createNotification(
            $conducteur,
            'Covoiturage annulé',
            sprintf(
                'Votre covoiturage %s → %s du %s a été annulé.',
                $covoiturage->getLieuDepart(),
                $covoiturage->getLieuArrivee(),
                $covoiturage->getDateDepart()->format('d/m/Y à H:i')
            ),
            'warning',
            ['covoiturage_id' => $covoiturage->getId()]
        );
    }

    /**
     * Notifier un crédit ajouté
     */
    public function notifyCreditsAdded(Utilisateur $utilisateur, int $montant, string $raison): void
    {
        $this->createNotification(
            $utilisateur,
            'Crédits ajoutés',
            sprintf(
                '%d crédits ont été ajoutés à votre compte. Raison: %s',
                $montant,
                $raison
            ),
            'success',
            ['credits' => $montant, 'raison' => $raison]
        );
    }

    /**
     * Notifier un crédit débité
     */
    public function notifyCreditsDebited(Utilisateur $utilisateur, int $montant, string $raison): void
    {
        $this->createNotification(
            $utilisateur,
            'Crédits débités',
            sprintf(
                '%d crédits ont été débités de votre compte. Raison: %s',
                $montant,
                $raison
            ),
            'warning',
            ['credits' => $montant, 'raison' => $raison]
        );
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Notification $notification): void
    {
        $notification->setLu(true);
        $this->entityManager->flush();
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    public function markAllAsRead(Utilisateur $utilisateur): void
    {
        $notifications = $this->entityManager->getRepository(Notification::class)
            ->findBy(['destinataire' => $utilisateur, 'lu' => false]);

        foreach ($notifications as $notification) {
            $notification->setLu(true);
        }

        $this->entityManager->flush();
    }

    /**
     * Obtenir les notifications non lues d'un utilisateur
     */
    public function getUnreadNotifications(Utilisateur $utilisateur): array
    {
        return $this->entityManager->getRepository(Notification::class)
            ->findBy(['destinataire' => $utilisateur, 'lu' => false], ['dateCreation' => 'DESC']);
    }

    /**
     * Compter les notifications non lues d'un utilisateur
     */
    public function countUnreadNotifications(Utilisateur $utilisateur): int
    {
        return $this->entityManager->getRepository(Notification::class)
            ->count(['destinataire' => $utilisateur, 'lu' => false]);
    }
}
