console.log("Exécution du script dashboard.js");

const API_BASE_URL = "/api";
const API_STATS_ENDPOINT = `${API_BASE_URL}/statistics/all`;

let statsCache = null;

function getAuthHeaders() {
    const headers = { Accept: "application/json" };
    const token = window.getToken ? window.getToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

async function fetchStatistics() {
    const response = await fetch(API_STATS_ENDPOINT, {
        headers: getAuthHeaders(),
        credentials: "include",
    });

    if (response.status === 401) {
        throw new Error("Accès non autorisé. Veuillez vous reconnecter avec un compte administrateur.");
    }
    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || payload.error || `Erreur ${response.status}`);
    }

    const payload = await response.json();
    return payload.data || payload;
}

function displayGlobalStats(stats) {
    document.getElementById("total-credits-platform").textContent =
        stats.financier?.credits_totaux ?? stats.totalCredits ?? "N/A";
    document.getElementById("total-active-users").textContent =
        stats.utilisateurs?.total_utilisateurs ?? stats.totalUsers ?? "N/A";
}

function extractDailyData(stats) {
    const fallback = stats.covoiturages?.journalier || stats.covoiturages?.per_day || stats.covoiturages?.par_jour;
    if (Array.isArray(fallback)) return fallback;

    const historique = stats.covoiturages?.historique || [];
    if (Array.isArray(historique)) return historique;

    return [];
}

function buildCovoitsChart(dailyData) {
    const canvas = document.getElementById("covoitsPerDayChart");
    if (!canvas || typeof Chart === "undefined") return;

    const existing = Chart.getChart(canvas);
    existing?.destroy();

    const labels = dailyData.map((item) => item.date || item.jour || "NC");
    const values = dailyData.map((item) => item.covoits ?? item.total ?? 0);

    new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Covoiturages",
                    data: values,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                },
            },
        },
    });
}

function buildCreditsChart(dailyData) {
    const canvas = document.getElementById("creditsPerDayChart");
    if (!canvas || typeof Chart === "undefined") return;

    const existing = Chart.getChart(canvas);
    existing?.destroy();

    const labels = dailyData.map((item) => item.date || item.jour || "NC");
    const values = dailyData.map((item) => item.creditsGagnes ?? item.credits ?? 0);

    new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Crédits gagnés",
                    data: values,
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1,
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
}

async function initializeAdminDashboard() {
    if (!window.isConnected || !window.isConnected() || window.getRole?.() !== "admin") {
        console.warn("Utilisateur non autorisé, redirection vers l'accueil.");
        window.location.replace("/");
        return;
    }

    try {
        const loadingIndicators = document.querySelectorAll("[data-admin-loading]");
        loadingIndicators.forEach((el) => (el.textContent = "Chargement..."));

        statsCache = await fetchStatistics();
        displayGlobalStats(statsCache);

        const dailyData = extractDailyData(statsCache);
        if (dailyData.length) {
            buildCovoitsChart(dailyData);
            buildCreditsChart(dailyData);
        } else {
            console.warn("Aucune donnée journalière à afficher.");
        }
    } catch (error) {
        console.error("Erreur dashboard admin :", error);
        alert(error.message || "Impossible de charger les statistiques administrateur.");
    }
}

initializeAdminDashboard();

