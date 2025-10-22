console.log("Exécution du script covoiturage_detail.js");

const API_BASE_URL = "/api";
const API_COVOIT_ENDPOINT = `${API_BASE_URL}/covoiturages`;

let currentCovoit = null;
let currentCovoitId = null;

/* OUTILS */
function getAuthHeaders(isJson = true) {
    const headers = {};
    if (isJson) {
        headers["Content-Type"] = "application/json";
        headers["Accept"] = "application/json";
    }
    const token = window.getToken ? window.getToken() : null;
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

function formatDateTime(isoString) {
    if (!isoString) return "Information non disponible";
    const date = new Date(isoString);
    return date.toLocaleString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function createAvisMarkup(avis) {
    if (!Array.isArray(avis) || avis.length === 0) {
        return '<div class="list-group-item text-center text-muted">Aucun avis pour ce covoiturage.</div>';
    }

    return avis
        .map(
            (item) => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between">
                    <h6 class="mb-1">${item.auteur?.pseudo || item.auteur?.nom || "Passager"}</h6>
                    <small>⭐ ${item.note ?? "NC"}</small>
                </div>
                <p class="mb-1 small">${item.commentaire || "Pas de commentaire laissé."}</p>
            </div>
        `
        )
        .join("");
}

/* APPELS API */
async function fetchCovoiturageById(id) {
    const response = await fetch(`${API_COVOIT_ENDPOINT}/${id}`, {
        headers: getAuthHeaders(false),
        credentials: "include",
    });

    if (!response.ok) {
        const message = response.status === 404 ? "Covoiturage introuvable." : "Erreur serveur lors du chargement du covoiturage.";
        throw new Error(`${message} (code ${response.status})`);
    }

    const data = await response.json();
    currentCovoit = data;
    return data;
}

async function reserveCovoiturage(id) {
    const response = await fetch(`${API_COVOIT_ENDPOINT}/${id}/reserve`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || payload.message || "Impossible de réserver ce covoiturage.");
    }

    return response.json();
}

/* GESTION DU DOM */
function updateParticipationButtonState() {
    const container = document.getElementById("participation-container");
    if (!container) return;

    container.innerHTML = "";

    const button = document.createElement("button");
    button.className = "btn btn-success btn-lg";

    const userConnected = window.isConnected ? window.isConnected() : false;
    const token = window.getToken ? window.getToken() : null;
    const placesRestantes = currentCovoit.placesRestantes ?? currentCovoit.nbPlacesRestantes ?? currentCovoit.nbPlace;

    if (!userConnected || !token) {
        button.className = "btn btn-outline-primary btn-lg";
        button.textContent = "Se connecter pour participer";
        button.addEventListener("click", () => window.location.replace("/signin"));
        container.appendChild(button);
        return;
    }

    if (placesRestantes !== null && placesRestantes <= 0) {
        button.className = "btn btn-secondary btn-lg";
        button.textContent = "Covoiturage complet";
        button.disabled = true;
        container.appendChild(button);
        return;
    }

    button.textContent = "Participer à ce covoiturage";
    button.addEventListener("click", handleParticipation);
    container.appendChild(button);
}

async function handleParticipation(event) {
    event?.preventDefault();
    if (!currentCovoit || !currentCovoitId) return;

    if (!window.isConnected || !window.isConnected()) {
        alert("Veuillez vous connecter pour participer.");
        return;
    }

    const confirmation = confirm("Confirmez-vous votre participation à ce covoiturage ?");
    if (!confirmation) return;

    const container = document.getElementById("participation-container");
    const previousHtml = container.innerHTML;
    container.innerHTML = '<button class="btn btn-success btn-lg" disabled><span class="spinner-border spinner-border-sm me-2"></span>Participation en cours...</button>';

    try {
        await reserveCovoiturage(currentCovoitId);
        alert("Votre participation a bien été enregistrée !");
        await displayCovoitDetails(); // rafraîchir l'affichage
    } catch (error) {
        console.error(error);
        container.innerHTML = previousHtml;
        alert(error.message || "Impossible de participer pour le moment.");
    }
}

function renderCovoiturageDetails() {
    const titleH1 = document.getElementById("detail-title");
    const contentDiv = document.getElementById("detail-content");

    if (!titleH1 || !contentDiv) return;
    contentDiv.innerHTML = "";

    const chauffeur = currentCovoit.chauffeur || currentCovoit.conducteur || {};
    const vehicule = currentCovoit.vehicule || {};

    const mainColumn = document.createElement("div");
    mainColumn.className = "col-lg-8";
    mainColumn.innerHTML = `
        <div class="card">
            <div class="card-header bg-primary text-white">Détails du trajet</div>
            <div class="card-body">
                <p><i class="bi bi-calendar-event me-1"></i> <strong>Date départ :</strong> ${formatDateTime(currentCovoit.dateDepart)}</p>
                <p><i class="bi bi-flag-fill me-1"></i> <strong>Lieu de départ :</strong> ${currentCovoit.lieuDepart || "NC"}</p>
                <p><i class="bi bi-flag me-1"></i> <strong>Lieu d'arrivée :</strong> ${currentCovoit.lieuArrivee || "NC"}</p>
                <p><i class="bi bi-currency-euro me-1"></i> <strong>Prix par passager :</strong> ${currentCovoit.prixPersonne ? Number(currentCovoit.prixPersonne).toFixed(2) : "NC"} €</p>
                <p><i class="bi bi-people-fill me-1"></i> <strong>Places restantes :</strong> ${currentCovoit.placesRestantes ?? currentCovoit.nbPlacesRestantes ?? "NC"}</p>
            </div>
        </div>

        <div class="card mt-4">
            <div class="card-header">Conducteur & véhicule</div>
            <div class="card-body row">
                <div class="col-md-4 text-center">
                    <img src="${chauffeur.photo || chauffeur.avatar || "images/default-profile.png"}"
                         alt="${chauffeur.pseudo || chauffeur.nom || "Conducteur"}"
                         class="img-fluid rounded-circle mb-2" style="max-width: 120px;">
                    <h5>${chauffeur.pseudo || chauffeur.nom || "Conducteur"}</h5>
                    <p>⭐ ${chauffeur.note ? Number(chauffeur.note).toFixed(1) : "N/A"} (${chauffeur.avisCount || chauffeur.totalAvis || 0} avis)</p>
                </div>
                <div class="col-md-8">
                    <h6>Véhicule</h6>
                    <p><i class="bi bi-car-front-fill me-1"></i> ${vehicule.marque || "NC"} ${vehicule.modele || ""} (${vehicule.couleur || "couleur NC"})</p>
                    <p><i class="bi bi-fuel-pump me-1"></i> Énergie : ${vehicule.energie || "NC"}</p>

                    <h6 class="mt-3">Préférences du conducteur</h6>
                    ${
                        chauffeur.preferences && chauffeur.preferences.length
                            ? `<ul>${chauffeur.preferences.map((pref) => `<li>${pref}</li>`).join("")}</ul>`
                            : "<p class='text-muted'>Aucune préférence renseignée.</p>"
                    }
                </div>
            </div>
        </div>

        <div id="participation-container" class="text-center my-4"></div>
    `;

    const avisColumn = document.createElement("div");
    avisColumn.className = "col-lg-4";
    avisColumn.innerHTML = `
        <div class="card">
            <div class="card-header">Avis des passagers</div>
            <div class="list-group list-group-flush">
                ${createAvisMarkup(currentCovoit.avis)}
            </div>
        </div>
    `;

    titleH1.textContent = `Covoiturage ${currentCovoit.lieuDepart || ""} → ${currentCovoit.lieuArrivee || ""}`;
    contentDiv.appendChild(mainColumn);
    contentDiv.appendChild(avisColumn);

    updateParticipationButtonState();
}

async function displayCovoitDetails() {
    const pathParts = window.location.pathname.split("/");
    currentCovoitId = pathParts[pathParts.length - 1];

    const contentDiv = document.getElementById("detail-content");
    const errorDiv = document.getElementById("detail-error");
    if (!currentCovoitId || !contentDiv || !errorDiv) return;

    contentDiv.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
        </div>
    `;
    errorDiv.classList.add("d-none");
    errorDiv.textContent = "";

    try {
        await fetchCovoiturageById(currentCovoitId);
        renderCovoiturageDetails();
    } catch (error) {
        console.error(error);
        contentDiv.innerHTML = "";
        errorDiv.textContent = error.message || "Erreur inattendue lors du chargement du covoiturage.";
        errorDiv.classList.remove("d-none");
    }
}

displayCovoitDetails().catch((error) => {
    console.error("Impossible d'afficher le détail du covoiturage :", error);
});

