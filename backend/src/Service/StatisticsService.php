<?php

namespace App\Service;

use App\Repository\UtilisateurRepository;
use App\Repository\CovoiturageRepository;
use App\Repository\VoitureRepository;
use App\Repository\AvisRepository;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;

class StatisticsService
{
    private EntityManagerInterface $entityManager;
    private UtilisateurRepository $utilisateurRepository;
    private CovoiturageRepository $covoiturageRepository;
    private VoitureRepository $voitureRepository;
    private AvisRepository $avisRepository;
    private NotificationRepository $notificationRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        UtilisateurRepository $utilisateurRepository,
        CovoiturageRepository $covoiturageRepository,
        VoitureRepository $voitureRepository,
        AvisRepository $avisRepository,
        NotificationRepository $notificationRepository
    ) {
        $this->entityManager = $entityManager;
        $this->utilisateurRepository = $utilisateurRepository;
        $this->covoiturageRepository = $covoiturageRepository;
        $this->voitureRepository = $voitureRepository;
        $this->avisRepository = $avisRepository;
        $this->notificationRepository = $notificationRepository;
    }

    /**
     * Obtenir les statistiques générales
     */
    public function getGeneralStats(): array
    {
        return [
            'total_utilisateurs' => $this->utilisateurRepository->count([]),
            'total_covoiturages' => $this->covoiturageRepository->count([]),
            'total_voitures' => $this->voitureRepository->count([]),
            'total_avis' => $this->avisRepository->count([]),
            'covoiturages_disponibles' => $this->covoiturageRepository->count(['status' => 'disponible']),
            'covoiturages_complets' => $this->covoiturageRepository->count(['status' => 'complet']),
            'avis_approuves' => $this->avisRepository->count(['statut' => 'approuvé']),
            'avis_en_attente' => $this->avisRepository->count(['statut' => 'en_attente']),
            'avis_rejetes' => $this->avisRepository->count(['statut' => 'rejeté']),
        ];
    }

    /**
     * Obtenir les statistiques des utilisateurs
     */
    public function getUserStats(): array
    {
        $totalUsers = $this->utilisateurRepository->count([]);
        $usersWithCars = $this->utilisateurRepository->countUsersWithCars();
        $usersWithTrips = $this->utilisateurRepository->countUsersWithTrips();
        $usersWithReviews = $this->utilisateurRepository->countUsersWithReviews();

        return [
            'total_utilisateurs' => $totalUsers,
            'utilisateurs_avec_voitures' => $usersWithCars,
            'utilisateurs_avec_trajets' => $usersWithTrips,
            'utilisateurs_avec_avis' => $usersWithReviews,
            'pourcentage_avec_voitures' => $totalUsers > 0 ? round(($usersWithCars / $totalUsers) * 100, 1) : 0,
            'pourcentage_avec_trajets' => $totalUsers > 0 ? round(($usersWithTrips / $totalUsers) * 100, 1) : 0,
            'pourcentage_avec_avis' => $totalUsers > 0 ? round(($usersWithReviews / $totalUsers) * 100, 1) : 0,
        ];
    }

    /**
     * Obtenir les statistiques des covoiturages
     */
    public function getCovoiturageStats(): array
    {
        $totalCovoiturages = $this->covoiturageRepository->count([]);
        $covoituragesDisponibles = $this->covoiturageRepository->count(['status' => 'disponible']);
        $covoituragesComplets = $this->covoiturageRepository->count(['status' => 'complet']);
        $covoituragesAnnules = $this->covoiturageRepository->count(['status' => 'annule']);

        // Statistiques par lieu de départ
        $topDepartures = $this->covoiturageRepository->getTopDepartureLocations(10);
        $topArrivals = $this->covoiturageRepository->getTopArrivalLocations(10);

        // Statistiques temporelles
        $covoituragesToday = $this->covoiturageRepository->countTodayCovoiturages();
        $covoituragesThisWeek = $this->covoiturageRepository->countThisWeekCovoiturages();
        $covoituragesThisMonth = $this->covoiturageRepository->countThisMonthCovoiturages();

        return [
            'total_covoiturages' => $totalCovoiturages,
            'disponibles' => $covoituragesDisponibles,
            'complets' => $covoituragesComplets,
            'annules' => $covoituragesAnnules,
            'pourcentage_disponibles' => $totalCovoiturages > 0 ? round(($covoituragesDisponibles / $totalCovoiturages) * 100, 1) : 0,
            'pourcentage_complets' => $totalCovoiturages > 0 ? round(($covoituragesComplets / $totalCovoiturages) * 100, 1) : 0,
            'pourcentage_annules' => $totalCovoiturages > 0 ? round(($covoituragesAnnules / $totalCovoiturages) * 100, 1) : 0,
            'top_departs' => $topDepartures,
            'top_arrivees' => $topArrivals,
            'aujourd_hui' => $covoituragesToday,
            'cette_semaine' => $covoituragesThisWeek,
            'ce_mois' => $covoituragesThisMonth,
        ];
    }

    /**
     * Obtenir les statistiques des avis
     */
    public function getAvisStats(): array
    {
        $totalAvis = $this->avisRepository->count([]);
        $avisApprouves = $this->avisRepository->count(['statut' => 'approuvé']);
        $avisEnAttente = $this->avisRepository->count(['statut' => 'en_attente']);
        $avisRejetes = $this->avisRepository->count(['statut' => 'rejeté']);

        // Statistiques par note
        $notesStats = $this->avisRepository->getStatsByNote();

        // Moyenne des notes
        $averageNote = $this->avisRepository->getAverageNote();

        return [
            'total_avis' => $totalAvis,
            'approuves' => $avisApprouves,
            'en_attente' => $avisEnAttente,
            'rejetes' => $avisRejetes,
            'pourcentage_approuves' => $totalAvis > 0 ? round(($avisApprouves / $totalAvis) * 100, 1) : 0,
            'pourcentage_en_attente' => $totalAvis > 0 ? round(($avisEnAttente / $totalAvis) * 100, 1) : 0,
            'pourcentage_rejetes' => $totalAvis > 0 ? round(($avisRejetes / $totalAvis) * 100, 1) : 0,
            'moyenne_notes' => round($averageNote, 2),
            'repartition_notes' => $notesStats,
        ];
    }

    /**
     * Obtenir les statistiques des notifications
     */
    public function getNotificationStats(): array
    {
        $totalNotifications = $this->notificationRepository->count([]);
        $unreadNotifications = $this->notificationRepository->count(['lu' => false]);

        // Statistiques par type
        $typesStats = $this->notificationRepository->getStatsByType();

        return [
            'total_notifications' => $totalNotifications,
            'non_lues' => $unreadNotifications,
            'pourcentage_non_lues' => $totalNotifications > 0 ? round(($unreadNotifications / $totalNotifications) * 100, 1) : 0,
            'repartition_types' => $typesStats,
        ];
    }

    /**
     * Obtenir les statistiques des véhicules
     */
    public function getVoitureStats(): array
    {
        $totalVoitures = $this->voitureRepository->count([]);

        // Statistiques par marque
        $marquesStats = $this->voitureRepository->getStatsByMarque();

        // Statistiques par énergie
        $energieStats = $this->voitureRepository->getStatsByEnergie();

        // Statistiques par couleur
        $couleurStats = $this->voitureRepository->getStatsByCouleur();

        return [
            'total_voitures' => $totalVoitures,
            'repartition_marques' => $marquesStats,
            'repartition_energies' => $energieStats,
            'repartition_couleurs' => $couleurStats,
        ];
    }

    /**
     * Obtenir les statistiques financières (crédits)
     */
    public function getFinancialStats(): array
    {
        $totalCredits = $this->utilisateurRepository->getTotalCredits();
        $averageCredits = $this->utilisateurRepository->getAverageCredits();
        $usersWithCredits = $this->utilisateurRepository->countUsersWithCredits();

        return [
            'credits_totaux' => $totalCredits,
            'credits_moyens' => round($averageCredits, 2),
            'utilisateurs_avec_credits' => $usersWithCredits,
            'pourcentage_avec_credits' => $this->utilisateurRepository->count([]) > 0 ?
                round(($usersWithCredits / $this->utilisateurRepository->count([])) * 100, 1) : 0,
        ];
    }

    /**
     * Obtenir les statistiques d'activité récentes
     */
    public function getRecentActivityStats(): array
    {
        $recentCovoiturages = $this->covoiturageRepository->findRecentCovoiturages(10);
        $recentAvis = $this->avisRepository->findRecentAvis(10);
        $recentUsers = $this->utilisateurRepository->findRecentUsers(10);

        return [
            'covoiturages_recents' => array_map([$this, 'serializeCovoiturageForStats'], $recentCovoiturages),
            'avis_recents' => array_map([$this, 'serializeAvisForStats'], $recentAvis),
            'utilisateurs_recents' => array_map([$this, 'serializeUserForStats'], $recentUsers),
        ];
    }

    /**
     * Obtenir toutes les statistiques en une fois
     */
    public function getAllStats(): array
    {
        return [
            'general' => $this->getGeneralStats(),
            'utilisateurs' => $this->getUserStats(),
            'covoiturages' => $this->getCovoiturageStats(),
            'avis' => $this->getAvisStats(),
            'notifications' => $this->getNotificationStats(),
            'vehicules' => $this->getVoitureStats(),
            'financier' => $this->getFinancialStats(),
            'activite_recente' => $this->getRecentActivityStats(),
        ];
    }

    private function serializeCovoiturageForStats($covoiturage): array
    {
        return [
            'id' => $covoiturage->getId(),
            'date_depart' => $covoiturage->getDateDepart()->format('Y-m-d H:i:s'),
            'lieu_depart' => $covoiturage->getLieuDepart(),
            'lieu_arrivee' => $covoiturage->getLieuArrivee(),
            'status' => $covoiturage->getStatus(),
            'conducteur' => $covoiturage->getVoiture()->getUtilisateur()->getPseudo(),
        ];
    }

    private function serializeAvisForStats($avis): array
    {
        return [
            'id' => $avis->getId(),
            'note' => $avis->getNote(),
            'commentaire' => substr($avis->getCommentaire(), 0, 100) . '...',
            'statut' => $avis->getStatut(),
            'auteur' => $avis->getAuteur()->getPseudo(),
            'date_creation' => $avis->getDateCreation()->format('Y-m-d H:i:s'),
        ];
    }

    private function serializeUserForStats($user): array
    {
        return [
            'id' => $user->getId(),
            'pseudo' => $user->getPseudo(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'email' => $user->getEmail(),
            'date_inscription' => $user->getDateCreation()?->format('Y-m-d H:i:s'),
            'credits' => $user->getCredits(),
        ];
    }
}
