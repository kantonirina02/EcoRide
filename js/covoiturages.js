console.log("Exécution du script covoiturages.js");

// --- Données Fictives de Covoiturages ---
const allCovoits = [
    {
        id: 1, depart: "Paris", arrivee: "Lyon", date: "2025-04-15", heureDepart: "08:00", heureArrivee: "12:30", prix: 25.50, placesRestantes: 3, ecologique: true,
        vehicule: { marque: "Tesla", modele: "Model 3", energie: "Électrique", couleur: "Blanche" }, 
        chauffeur: {
            pseudo: "ChauffeurCool75", photo: "/images/Andrea.jpg", note: 4.8, avisCount: 15,
            preferences: ["Non fumeur", "Musique calme", "Pas d'animaux"],
            avisRecus: [ 
                { auteur: "Passager1", note: 5, commentaire: "Trajet parfait, conduite très agréable !" },
                { auteur: "Passager2", note: 4, commentaire: "Bon conducteur, voiture propre." }
            ]
        }
    },
    {
        id: 2, depart: "Paris", arrivee: "Lyon", date: "2025-04-15", heureDepart: "09:30", heureArrivee: "14:00", prix: 28.00, placesRestantes: 1, ecologique: false,
        vehicule: { marque: "Peugeot", modele: "308", energie: "Essence", couleur: "Grise" },
        chauffeur: {
            pseudo: "VoyageurPro", photo: "images/default-profile.png", note: 4.5, avisCount: 8,
            preferences: ["Accepte les fumeurs (fenêtre ouverte)", "Discussion bienvenue"],
            avisRecus: [
                { auteur: "Passager3", note: 4, commentaire: "Bien, mais un peu de retard." },
            ]
        }
    },
    {
        id: 3, depart: "Marseille", arrivee: "Nice", date: "2025-04-16", heureDepart: "10:00", heureArrivee: "12:15", prix: 15.00, placesRestantes: 2, ecologique: true,
        vehicule: { marque: "Renault", modele: "Zoe", energie: "Électrique", couleur: "Bleue" },
        chauffeur: {
            pseudo: "Soleil13", photo: "images/default-profile.png", note: 4.9, avisCount: 22,
            preferences: ["Non fumeur", "Petits animaux acceptés (en cage)", "Musique variée"],
            avisRecus: [
                { auteur: "Passager4", note: 5, commentaire: "Super sympa et arrangeant !" },
                { auteur: "Passager5", note: 5, commentaire: "Conduite impeccable, je recommande." },
                { auteur: "Passager6", note: 5, commentaire: "Ponctuel et agréable." },
            ]
        }
    },
    {
        id: 4, depart: "Paris", arrivee: "Lille", date: "2025-04-15", heureDepart: "14:00", heureArrivee: "16:30", prix: 18.00, placesRestantes: 4, ecologique: false,
        vehicule: { marque: "Citroën", modele: "C4", energie: "Diesel", couleur: "Noire" },
        chauffeur: {
            pseudo: "NordisteRapide", photo: "images/default-profile.png", note: 4.2, avisCount: 5,
            preferences: ["Fumeur OK", "Pas d'animaux"],
            avisRecus: [{ auteur: "Passager7", note: 4, commentaire: "Correct."}]
        }
     },
    {
        id: 5, depart: "Lyon", arrivee: "Paris", date: "2025-04-17", heureDepart: "07:00", heureArrivee: "11:30", prix: 26.00, placesRestantes: 2, ecologique: true,
        vehicule: { marque: "Hyundai", modele: "Kona Electric", energie: "Électrique", couleur: "Verte" },
        chauffeur: {
             pseudo: "RetourParis", photo: "images/default-profile.png", note: 4.7, avisCount: 11,
             preferences: ["Non fumeur", "Pas d'animaux"],
             avisRecus: [ { auteur: "Passager8", note: 5, commentaire: "Très bon trajet retour."}]
        }
    },
];

let currentSearchResults = []; 
let filterTimeoutId = null;

// --- Fonctions Utilitaires ---
/**
 * Formate une date YYYY-MM-DD en DD/MM/YYYY
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {string} Date formatée ou chaîne vide
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Crée l'élément HTML pour un covoiturage donné
 * @param {object} covoit - L'objet covoiturage
 * @returns {HTMLElement} L'élément div.covoit
 */
function createCovoitElement(covoit) {
    const div = document.createElement('div');
    div.className = 'covoit card mb-3'; 

   div.innerHTML = `
   <div class="row g-0">
       <div class="col-md-2 d-flex flex-column align-items-center justify-content-center p-2">
           <img src="${covoit.chauffeur.photo || 'images/default-profile.png'}" alt="${covoit.chauffeur.pseudo}" class="profile-img img-fluid rounded-circle mb-1" style="width: 60px; height: 60px;">
           <span class="fw-bold small text-center">${covoit.chauffeur.pseudo}</span>
           <span class="small text-muted">⭐ ${covoit.chauffeur.note ? covoit.chauffeur.note.toFixed(1) : 'N/A'} (${covoit.chauffeur.avisCount || 0})</span>
       </div>
       <div class="col-md-7">
           <div class="card-body">
               <p class="card-text mb-1">
                   <i class="bi bi-box-arrow-up-right me-1"></i> <strong>Départ:</strong> ${covoit.depart} (${covoit.heureDepart})
               </p>
               <p class="card-text mb-1">
                    <i class="bi bi-box-arrow-in-down-left me-1"></i> <strong>Arrivée:</strong> ${covoit.arrivee} (${covoit.heureArrivee})
               </p>
               <p class="card-text mb-1"><i class="bi bi-calendar-event me-1"></i> <strong>Date:</strong> ${formatDate(covoit.date)}</p>
               <p class="card-text mb-1"><i class="bi bi-people-fill me-1"></i> <strong>Places restantes:</strong> ${covoit.placesRestantes}</p>
                ${covoit.ecologique ? '<span class="badge bg-success mb-1"><i class="bi bi-leaf me-1"></i>Écologique</span>' : ''}
           </div>
       </div>
       <div class="col-md-3 d-flex flex-column align-items-center justify-content-center p-2 border-start">
            <p class="h5 mb-2">${covoit.prix.toFixed(2)} €</p>
            <a href="/covoiturages/${covoit.id}" class="btn btn-sm btn-primary detail w-100" data-link>Voir Détails</a> 
       </div>
   </div>
`;
return div;
}

/**
 * Affiche les covoiturages dans la liste
 * @param {array} covoitsToShow - Tableau des covoiturages à afficher
 */
function displayResults(covoitsToShow) {
    const listContainer = document.getElementById('covoit-list');
    const feedbackContainer = document.getElementById('results-feedback');
    const filterWrapper = document.getElementById('filter-section-wrapper'); 

    if (!listContainer || !feedbackContainer || !filterWrapper) {
        console.error("Impossible de trouver les conteneurs de résultats ou de filtres.");
        return;
    }

    listContainer.innerHTML = ''; // Vide la liste précédente
    feedbackContainer.textContent = ''; // Vide le message précédent
    
    if (covoitsToShow && covoitsToShow.length > 0) {
        console.log(`Affichage de ${covoitsToShow.length} résultats filtrés.`);
        covoitsToShow.forEach(covoit => {
            const covoitElement = createCovoitElement(covoit);
            listContainer.appendChild(covoitElement);
        });
        filterWrapper.style.display = 'block'; // Affiche les filtres
    } else {
        // Si aucun résultat après filtrage OU recherche initiale
        if (currentSearchResults.length > 0) {
             // Il y avait des résultats de recherche, mais les filtres les ont tous enlevés
             feedbackContainer.textContent = 'Aucun covoiturage ne correspond aux filtres actuels.';
        } else {
            // La recherche initiale n'a donné aucun résultat
            feedbackContainer.textContent = 'Aucun covoiturage trouvé pour ces critères de recherche.';
        }
        filterWrapper.style.display = 'none'; // Cache les filtres si aucun résultat
    }
}

/**
 * Simule la recherche de covoiturages en filtrant les données fictives
 * @param {string} depart
 * @param {string} arrivee
 * @param {string} date - Format YYYY-MM-DD
 * @returns {array} Tableau des covoiturages correspondants
 */
function searchCovoits(depart, arrivee, date) {
    console.log(`Recherche fictive pour: ${depart} -> ${arrivee} le ${date}`);
    const results = allCovoits.filter(covoit => {
        const matchDepart = !depart || covoit.depart.toLowerCase().includes(depart.toLowerCase());
        const matchArrivee = !arrivee || covoit.arrivee.toLowerCase().includes(arrivee.toLowerCase());
        const matchDate = !date || covoit.date === date;
        return matchDepart && matchArrivee && matchDate;
    });

    console.log(`Trouvé ${results.length} résultat(s)`);
    return results;
}

// --- Fonction pour appliquer les Filtres ---
function applyFilters() {
    const priceInput = document.getElementById('priceFilter');
    const priceValueString = priceInput?.value;
    console.log("Valeur brute de #priceFilter:", priceValueString);

    // Récupérer les valeurs actuelles des filtres
    const ecoChecked = document.getElementById('ecoFilter')?.checked; // ?. pour sécurité si élément non trouvé
    const maxPrice = parseFloat(priceValueString) || null; 
    // const maxDuration = parseInt(document.getElementById('durationFilter')?.value) || null; // Pour plus tard
    const minRating = parseFloat(document.getElementById('ratingFilter')?.value) || null; 

    console.log("Application des filtres :", { ecoChecked, maxPrice, minRating });

    // Filtrer la liste des résultats initiaux (stockée dans currentSearchResults)
    const filteredResults = currentSearchResults.filter(covoit => {
        // Condition Filtre Écologique
        if (ecoChecked && !covoit.ecologique) {
            return false; 
        }
        // Condition Filtre Prix Maximum
        if (maxPrice !== null && covoit.prix > maxPrice) {
            return false; 
        }
        if (minRating !== null && (!covoit.chauffeur.note || covoit.chauffeur.note < minRating)) {
            return false; 
        }
        return true;
    });
    console.log("Appel de displayResults AVEC les résultats filtrés:", filteredResults);
    displayResults(filteredResults);
}


// --- Logique Principale à l'exécution du script ---

function initializeCovoituragesPage() {
    console.log("Initialisation de la page covoiturages (corrigé)...");

    // Récupérer les éléments du DOM
    const searchForm = document.getElementById('rideSearchForm');
    const departureInput = document.getElementById('departure');
    const arrivalInput = document.getElementById('arrival');
    const dateInput = document.getElementById('date');
    const searchErrorDiv = document.getElementById('search-error-covoit');
    const feedbackContainer = document.getElementById('results-feedback');
    const filterForm = document.getElementById('filterForm');

    // 1. Lire les paramètres de recherche depuis l'URL 
    const urlParams = new URLSearchParams(window.location.search);
    const initialDepart = urlParams.get('depart_ville') || '';
    const initialArrivee = urlParams.get('arrivee_ville') || '';
    const initialDate = urlParams.get('date_voyage') || '';

    console.log(`Paramètres URL : depart=${initialDepart}, arrivee=${initialArrivee}, date=${initialDate}`);

    // 2. Pré-remplir le formulaire de recherche sur cette page
    if (departureInput) departureInput.value = initialDepart;
    if (arrivalInput) arrivalInput.value = initialArrivee;
    if (dateInput) dateInput.value = initialDate;

    // 3. Lancer la recherche initiale SI des paramètres sont présents
    if (initialDepart && initialArrivee && initialDate) {
        console.log("Lancement de la recherche initiale");
        currentSearchResults = searchCovoits(initialDepart, initialArrivee, initialDate);
        displayResults(currentSearchResults);
    } else {
        // Afficher message par défaut si pas de recherche initiale (US 3)
        console.log("Aucune recherche initiale à effectuer.");
        if (feedbackContainer) {
            feedbackContainer.textContent = 'Veuillez utiliser le formulaire ci-dessus pour rechercher un covoiturage.';
        }
        displayResults([]);
         // Assurer que la liste est vide et les filtres cachés
        const listContainer = document.getElementById('covoit-list');
        const filterWrapper = document.getElementById('filter-section-wrapper');
        if(listContainer) listContainer.innerHTML = '';
        if(filterWrapper) filterWrapper.style.display = 'none';
    }

    // 4. Gérer la soumission du formulaire de recherche DE CETTE PAGE
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Empêche le rechargement
            console.log("Nouvelle recherche soumise depuis la page covoiturages...");

            const departValue = departureInput.value.trim();
            const arriveeValue = arrivalInput.value.trim();
            const dateValue = dateInput.value.trim();

            searchErrorDiv.textContent = ''; // Nettoie les erreurs précédentes

            let isValid = true;
            if (!departValue || !arriveeValue || !dateValue) {
                 searchErrorDiv.textContent = 'Veuillez remplir tous les champs de recherche.';
                 isValid = false;
            }
             // Validation date passée
             if (dateValue){
                 const today = new Date();
                 const selectedDate = new Date(dateValue);
                 today.setHours(0, 0, 0, 0);
                 selectedDate.setHours(0, 0, 0, 0);
                 if (selectedDate < today) {
                      searchErrorDiv.textContent += ' La date ne peut pas être dans le passé.';
                      isValid = false;
                 }
             }

            if (!isValid) return;

            // Met à jour l'URL SANS recharger 
             const newUrlParams = new URLSearchParams();
             newUrlParams.set('depart_ville', departValue);
             newUrlParams.set('arrivee_ville', arriveeValue);
             newUrlParams.set('date_voyage', dateValue);
             // Remplace l'état actuel de l'historique sans ajouter une nouvelle entrée
             window.history.replaceState({}, '', `${window.location.pathname}?${newUrlParams.toString()}`);

            currentSearchResults = searchCovoits(departValue, arriveeValue, dateValue);
            if(filterForm) filterForm.reset();
            displayResults(currentSearchResults);
        });
    } else {
        console.error("Le formulaire #rideSearchForm n'a pas été trouvé.");
    }

    if (filterForm) {
        filterForm.addEventListener('input', () => {
            console.log("Input détecté dans les filtres.");
            clearTimeout(filterTimeoutId);

            filterTimeoutId = setTimeout(() => {
                console.log("Délai écoulé, application des filtres...");
                applyFilters(); // Appelle la fonction applyFilters après le délai
            }, 300); // Délai en millisecondes
        });
        console.log("Écouteur d'événements 'input' avec debouncing ajouté au formulaire de filtres.");
    } else {
         console.error("Le formulaire #filterForm n'a pas été trouvé.");
    }

}

// --- Exécution ---
initializeCovoituragesPage();
