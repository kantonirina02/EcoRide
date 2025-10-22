console.log("Exécution du script covoiturages.js");

/* CONSTANTES & VARIABLES GLOBALES */
const API_BASE_URL = "/api";
const API_COVOIT_ENDPOINT = `${API_BASE_URL}/covoiturages`;

let currentSearchResults = [];
let filterTimeoutId = null;

/* OUTILS D'AFFICHAGE */
function formatDate(isoDate) {
    if (!isoDate) {
        return "Date non communiquée";
    }
    const [year, month, day] = isoDate.split("-"); // L’API renvoie un format YYYY-MM-DD
    return `${day}/${month}/${year}`;
}

function createCovoitCard(covoit) {
    const div = document.createElement("div");
    div.className = "covoit card mb-3";

    const chauffeur = covoit.chauffeur || covoit.conducteur || {};
    const vehicule = covoit.vehicule || {};
    const prix = typeof covoit.prix === "number" ? covoit.prix : covoit.prixPersonne;
    const depart = covoit.depart || covoit.lieuDepart;
    const arrivee = covoit.arrivee || covoit.lieuArrivee;
    const date = covoit.date || covoit.dateDepart?.slice(0, 10);
    const heureDepart = covoit.heureDepart || covoit.dateDepart?.slice(11, 16);
    const heureArrivee = covoit.heureArrivee || covoit.dateArrivee?.slice(11, 16);
    const placesRestantes = covoit.placesRestantes ?? covoit.nbPlacesRestantes ?? covoit.nbPlace;
    const noteChauffeur = chauffeur.note || chauffeur.averageRating;
    const nbAvis = chauffeur.avisCount || chauffeur.totalAvis || 0;
    const photo = chauffeur.photo || chauffeur.avatar || "images/default-profile.png";
    const isEco =
        covoit.ecologique === true ||
        (vehicule.energie && vehicule.energie.toLowerCase().includes("élect"));

    div.innerHTML = `
        <div class="row g-0">
            <div class="col-md-2 d-flex flex-column align-items-center justify-content-center p-2">
                <img src="${photo}" alt="${chauffeur.pseudo || chauffeur.nom || "Conducteur"}"
                     class="profile-img img-fluid rounded-circle mb-1" style="width: 60px; height: 60px;">
                <span class="fw-bold small text-center">${chauffeur.pseudo || chauffeur.nom || "Conducteur"}</span>
                <span class="small text-muted">⭐ ${noteChauffeur ? Number(noteChauffeur).toFixed(1) : "N/A"} (${nbAvis})</span>
            </div>
            <div class="col-md-7">
                <div class="card-body">
                    <p class="card-text mb-1">
                        <i class="bi bi-box-arrow-up-right me-1"></i> <strong>Départ :</strong> ${depart || "NC"} (${heureDepart || "‑"})
                    </p>
                    <p class="card-text mb-1">
                        <i class="bi bi-geo-alt-fill me-1"></i> <strong>Arrivée :</strong> ${arrivee || "NC"} (${heureArrivee || "‑"})
                    </p>
                    <p class="card-text mb-1">
                        <i class="bi bi-calendar-event me-1"></i> <strong>Date :</strong> ${formatDate(date)}
                    </p>
                    <p class="card-text mb-1">
                        <i class="bi bi-people-fill me-1"></i> <strong>Places restantes :</strong> ${placesRestantes ?? "NC"}
                    </p>
                    <p class="card-text mb-1">
                        <i class="bi bi-currency-euro me-1"></i> <strong>Prix par passager :</strong> ${prix ? Number(prix).toFixed(2) : "NC"} €
                    </p>
                    ${
                        isEco
                            ? `<span class="badge bg-success"><i class="bi bi-leaf me-1"></i> Voyage écologique</span>`
                            : `<span class="badge bg-secondary"><i class="bi bi-gear-fill me-1"></i> Standard</span>`
                    }
                </div>
            </div>
            <div class="col-md-3 d-flex flex-column align-items-center justify-content-center p-3">
                <a href="/covoiturages/${covoit.id}" data-link class="btn btn-primary w-100 mb-2">Détail</a>
                <button class="btn btn-outline-secondary w-100" disabled>
                    <i class="bi bi-clock"></i> Durée estimée : ${covoit.duree || covoit.dureeEstimee || "NC"}
                </button>
            </div>
        </div>
    `;

    return div;
}

function displayResults(covoits) {
    const listContainer = document.getElementById("covoit-list");
    const feedbackContainer = document.getElementById("results-feedback");
    const filterWrapper = document.getElementById("filter-section-wrapper");

    if (!listContainer || !feedbackContainer || !filterWrapper) {
        console.error("Impossible de trouver les conteneurs de résultats ou de filtres.");
        return;
    }

    listContainer.innerHTML = "";
    feedbackContainer.textContent = "";

    if (Array.isArray(covoits) && covoits.length > 0) {
        covoits.forEach((covoit) => listContainer.appendChild(createCovoitCard(covoit)));
        filterWrapper.style.display = "block";
    } else {
        feedbackContainer.textContent = currentSearchResults.length
            ? "Aucun covoiturage ne correspond aux filtres actuels."
            : "Aucun covoiturage trouvé pour ces critères.";
        filterWrapper.style.display = "none";
    }
}

/*APPELS API */
async function fetchCovoiturages({ depart, arrivee, date }) {
    const params = new URLSearchParams();
    if (depart) params.append("depart", depart);
    if (arrivee) params.append("arrivee", arrivee);
    if (date) params.append("date", date);

    const url = `${API_COVOIT_ENDPOINT}${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        const message = response.status === 404 ? "Aucun trajet disponible." : "Erreur lors de la récupération des covoiturages.";
        throw new Error(`${message} (code ${response.status})`);
    }

    return response.json();
}

async function searchCovoits(depart, arrivee, date) {
    const covoits = await fetchCovoiturages({ depart, arrivee, date });
    currentSearchResults = Array.isArray(covoits) ? covoits : [];
    return currentSearchResults;
}

/* FILTRES */
function applyFilters() {
    const ecoChecked = document.getElementById("ecoFilter")?.checked;
    const maxPrice = parseFloat(document.getElementById("priceFilter")?.value);
    const minRating = parseFloat(document.getElementById("ratingFilter")?.value);
    const maxDurationInput = document.getElementById("durationFilter");
    const maxDuration = maxDurationInput ? parseInt(maxDurationInput.value, 10) : null;

    const filtered = currentSearchResults.filter((covoit) => {
        const vehicule = covoit.vehicule || {};
        const chauffeur = covoit.chauffeur || covoit.conducteur || {};
        const isEco =
            covoit.ecologique === true ||
            (vehicule.energie && vehicule.energie.toLowerCase().includes("élect"));
        const prix = typeof covoit.prix === "number" ? covoit.prix : covoit.prixPersonne;
        const note = chauffeur.note || chauffeur.averageRating;
        const dureeStr = covoit.duree || covoit.dureeEstimee;
        const duree = dureeStr ? parseInt(dureeStr, 10) : null;

        if (ecoChecked && !isEco) return false;
        if (!Number.isNaN(maxPrice) && maxPrice && prix > maxPrice) return false;
        if (!Number.isNaN(minRating) && minRating && (!note || note < minRating)) return false;
        if (!Number.isNaN(maxDuration) && maxDuration && duree && duree > maxDuration) return false;

        return true;
    });

    displayResults(filtered);
}

/*FLUX PRINCIPAL */
async function initializeCovoituragesPage() {
    const searchForm = document.getElementById("rideSearchForm");
    const departureInput = document.getElementById("departure");
    const arrivalInput = document.getElementById("arrival");
    const dateInput = document.getElementById("date");
    const searchErrorDiv = document.getElementById("search-error-covoit");
    const feedbackContainer = document.getElementById("results-feedback");
    const filterForm = document.getElementById("filterForm");

    const urlParams = new URLSearchParams(window.location.search);
    const initialDepart = urlParams.get("depart_ville") || "";
    const initialArrivee = urlParams.get("arrivee_ville") || "";
    const initialDate = urlParams.get("date_voyage") || "";

    if (departureInput) departureInput.value = initialDepart;
    if (arrivalInput) arrivalInput.value = initialArrivee;
    if (dateInput) dateInput.value = initialDate;

    if (initialDepart && initialArrivee && initialDate) {
        feedbackContainer.textContent = "Recherche en cours...";
        try {
            await searchCovoits(initialDepart, initialArrivee, initialDate);
            displayResults(currentSearchResults);
        } catch (error) {
            console.error(error);
            feedbackContainer.textContent = error.message;
            displayResults([]);
        }
    } else {
        feedbackContainer.textContent = "Veuillez utiliser le formulaire ci-dessus pour rechercher un covoiturage.";
        displayResults([]);
    }

    if (searchForm) {
        searchForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const departValue = departureInput.value.trim();
            const arriveeValue = arrivalInput.value.trim();
            const dateValue = dateInput.value.trim();

            searchErrorDiv.textContent = "";

            if (!departValue || !arriveeValue || !dateValue) {
                searchErrorDiv.textContent = "Veuillez remplir tous les champs de recherche.";
                return;
            }

            const today = new Date();
            const selectedDate = new Date(dateValue);
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                searchErrorDiv.textContent = "La date ne peut pas être dans le passé.";
                return;
            }

            window.history.replaceState({}, "", `${window.location.pathname}?depart_ville=${departValue}&arrivee_ville=${arriveeValue}&date_voyage=${dateValue}`);

            feedbackContainer.textContent = "Recherche en cours...";
            try {
                await searchCovoits(departValue, arriveeValue, dateValue);
                if (filterForm) filterForm.reset();
                displayResults(currentSearchResults);
            } catch (error) {
                console.error(error);
                feedbackContainer.textContent = error.message || "Impossible de récupérer les covoiturages.";
                displayResults([]);
            }
        });
    } else {
        console.error("Le formulaire de recherche n'a pas été trouvé dans le DOM.");
    }

    if (filterForm) {
        filterForm.addEventListener("input", () => {
            clearTimeout(filterTimeoutId);
            filterTimeoutId = setTimeout(applyFilters, 300);
        });
    }
}

initializeCovoituragesPage().catch((error) => {
    console.error("Erreur lors de l'initialisation de la page covoiturages :", error);
});

