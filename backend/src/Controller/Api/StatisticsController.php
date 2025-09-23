<?php

namespace App\Controller\Api;

use App\Service\StatisticsService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/statistics', name: 'api_statistics_')]
#[IsGranted('ROLE_ADMIN')]
class StatisticsController extends AbstractController
{
    public function __construct(
        private StatisticsService $statisticsService
    ) {
    }

    #[Route('', name: 'all', methods: ['GET'])]
    public function getAllStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getAllStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    #[Route('/general', name: 'general', methods: ['GET'])]
    public function getGeneralStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getGeneralStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    #[Route('/users', name: 'users', methods: ['GET'])]
    public function getUserStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getUserStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    #[Route('/covoiturages', name: 'covoiturages', methods: ['GET'])]
    public function getCovoiturageStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getCovoiturageStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    #[Route('/avis', name: 'avis', methods: ['GET'])]
    public function getAvisStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getAvisStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    #[Route('/notifications', name: 'notifications', methods: ['GET'])]
    public function getNotificationStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getNotificationStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    #[Route('/vehicules', name: 'vehicules', methods: ['GET'])]
    public function getVoitureStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getVoitureStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    #[Route('/financial', name: 'financial', methods: ['GET'])]
    public function getFinancialStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getFinancialStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    #[Route('/recent-activity', name: 'recent_activity', methods: ['GET'])]
    public function getRecentActivityStatistics(): JsonResponse
    {
        $stats = $this->statisticsService->getRecentActivityStats();

        return $this->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
