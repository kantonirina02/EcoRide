<?php

namespace App\Repository;

use App\Entity\Notification;
use App\Entity\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notification>
 *
 * @method Notification|null find($id, $lockMode = null, $lockVersion = null)
 * @method Notification|null findOneBy(array $criteria, array $orderBy = null)
 * @method Notification[]    findAll()
 * @method Notification[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    /**
     * Trouver les notifications d'un utilisateur
     */
    public function findByUtilisateur(Utilisateur $utilisateur, int $limit = null): array
    {
        $query = $this->createQueryBuilder('n')
            ->where('n.destinataire = :utilisateur')
            ->setParameter('utilisateur', $utilisateur)
            ->orderBy('n.dateCreation', 'DESC');

        if ($limit) {
            $query->setMaxResults($limit);
        }

        return $query->getQuery()->getResult();
    }

    /**
     * Compter les notifications non lues d'un utilisateur
     */
    public function countUnreadByUtilisateur(Utilisateur $utilisateur): int
    {
        return $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->where('n.destinataire = :utilisateur')
            ->andWhere('n.lu = false')
            ->setParameter('utilisateur', $utilisateur)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Trouver les notifications non lues d'un utilisateur
     */
    public function findUnreadByUtilisateur(Utilisateur $utilisateur, int $limit = null): array
    {
        $query = $this->createQueryBuilder('n')
            ->where('n.destinataire = :utilisateur')
            ->andWhere('n.lu = false')
            ->setParameter('utilisateur', $utilisateur)
            ->orderBy('n.dateCreation', 'DESC');

        if ($limit) {
            $query->setMaxResults($limit);
        }

        return $query->getQuery()->getResult();
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    public function markAllAsReadByUtilisateur(Utilisateur $utilisateur): int
    {
        return $this->createQueryBuilder('n')
            ->update()
            ->set('n.lu', true)
            ->where('n.destinataire = :utilisateur')
            ->andWhere('n.lu = false')
            ->setParameter('utilisateur', $utilisateur)
            ->getQuery()
            ->execute();
    }

    /**
     * Supprimer les anciennes notifications lues
     */
    public function deleteOldReadNotifications(\DateTime $olderThan): int
    {
        return $this->createQueryBuilder('n')
            ->delete()
            ->where('n.lu = true')
            ->andWhere('n.dateCreation < :date')
            ->setParameter('date', $olderThan)
            ->getQuery()
            ->execute();
    }
}
