console.log("Exécution script dashboard.js");

// --- Données Fictives pour les Graphiques ---
// ces données qui vien d'une API backend
const dailyStatsData = [
    { date: "2025-04-10", covoits: 5, creditsGagnes: 10 },
    { date: "2025-04-11", covoits: 8, creditsGagnes: 16 },
    { date: "2025-04-12", covoits: 6, creditsGagnes: 12 },
    { date: "2025-04-13", covoits: 10, creditsGagnes: 20 },
    { date: "2025-04-14", covoits: 12, creditsGagnes: 24 },
    { date: "2025-04-15", covoits: 9, creditsGagnes: 18 },
    { date: "2025-04-16", covoits: 11, creditsGagnes: 22 },
];

const totalCreditsPlatformeFictif = 122; // Calculé à partir des données ci-dessus ou une valeur fixe

// --- Fonctions pour créer les graphiques ---
/**
 * Crée le graphique des covoiturages par jour
 */
function createCovoitsChart() {
    const ctx = document.getElementById('covoitsPerDayChart');
    if (!ctx) {
        console.error("Canvas 'covoitsPerDayChart' non trouvé.");
        return;
    }

    // Préparer les données pour Chart.js
    const labels = dailyStatsData.map(item => {
        // Formater la date pour l'axe X (ex: 10/04)
        const parts = item.date.split('-');
        return `${parts[2]}/${parts[1]}`;
    });
    const dataValues = dailyStatsData.map(item => item.covoits);

    // Détruire l'ancien graphique s'il existe (pour éviter les problèmes au rechargement)
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }


    // Créer le nouveau graphique
    new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: '# Covoiturages', data: dataValues, backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }] },
        options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, responsive: true, maintainAspectRatio: true }
    });
    console.log("Graphique Covoiturages/Jour créé.");
}

/**
 * Crée le graphique des crédits gagnés par jour
 */
function createCreditsChart() {
    const ctx = document.getElementById('creditsPerDayChart');
     if (!ctx) { console.error("Canvas 'creditsPerDayChart' non trouvé."); return; }
     const labels = dailyStatsData.map(item => `${item.date.split('-')[2]}/${item.date.split('-')[1]}`);
     const dataValues = dailyStatsData.map(item => item.creditsGagnes);

     const existingChart = Chart.getChart(ctx);
     if (existingChart) existingChart.destroy();

     new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [{ label: 'Crédits Gagnés', data: dataValues, fill: false, borderColor: 'rgb(75, 192, 192)', tension: 0.1 }] },
        options: { scales: { y: { beginAtZero: true } }, responsive: true, maintainAspectRatio: true }
    });
     console.log("Graphique Crédits/Jour créé.");
}

/**
 * Affiche les statistiques globales
 */
function displayGlobalStats() {
    const totalCreditsElement = document.getElementById('total-credits-platform');
    if (totalCreditsElement) {
        totalCreditsElement.textContent = totalCreditsPlatformeFictif;
         console.log("Stats globales affichées.");
    }
     // Mettre à jour d'autres stats si besoin (utilisateurs actifs...)
}


// --- Initialisation de la Page Admin ---
function initializeAdminDashboard() {
    console.log("Initialisation du dashboard admin...");

    // Vérifier le rôle (sécurité supplémentaire côté client)
    if(!window.isConnected() || window.getRole() !== 'admin') {
         console.warn("Accès admin non autorisé détecté côté client, redirection...");
          window.location.replace("/"); // ou /signin
         return;
    }

    // Afficher les stats et créer les graphiques
    displayGlobalStats();
    setTimeout(() => {
        createCovoitsChart();
        createCreditsChart();
    }, 100);

     console.log("Dashboard admin initialisé.");
}

// Exécuter l'initialisation
initializeAdminDashboard();
