console.log("Exécution script avis_moderation.js");

// --- Données Fictives d'Avis (Simulation) ---
// récupérées via API 
let allAvisFictifs = [
    { id: 101, covoitId: 1, auteurPseudo: "Passager1", chauffeurPseudo: "ChauffeurCool75", note: 5, commentaire: "Trajet parfait, conduite très agréable !", statut: "Approuvé" },
    { id: 102, covoitId: 1, auteurPseudo: "Passager2", chauffeurPseudo: "ChauffeurCool75", note: 4, commentaire: "Bon conducteur, voiture propre.", statut: "Approuvé" },
    { id: 103, covoitId: 2, auteurPseudo: "Passager3", chauffeurPseudo: "VoyageurPro", note: 4, commentaire: "Bien, mais un peu de retard.", statut: "En attente" }, // <= En attente
    { id: 104, covoitId: 3, auteurPseudo: "Passager4", chauffeurPseudo: "Soleil13", note: 5, commentaire: "Super sympa et arrangeant !", statut: "Approuvé" },
    { id: 105, covoitId: 3, auteurPseudo: "Passager5", chauffeurPseudo: "Soleil13", note: 5, commentaire: "Conduite impeccable, je recommande.", statut: "Approuvé" },
    { id: 106, covoitId: 3, auteurPseudo: "Passager6", chauffeurPseudo: "Soleil13", note: 5, commentaire: "Ponctuel et agréable.", statut: "Approuvé" },
    { id: 107, covoitId: 4, auteurPseudo: "Passager7", chauffeurPseudo: "NordisteRapide", note: 2, commentaire: "Conduite dangereuse et voiture sale.", statut: "En attente" }, // <= En attente
    { id: 108, covoitId: 5, auteurPseudo: "Passager8", chauffeurPseudo: "RetourParis", note: 1, commentaire: "Ne s'est jamais présenté !", statut: "Rejeté" }, // <= Rejeté
    { id: 109, covoitId: 1, auteurPseudo: "Passager9", chauffeurPseudo: "ChauffeurCool75", note: 5, commentaire: "Excellent !", statut: "En attente" }, // <= En attente
];

// Variable pour garder le filtre de statut actuel
let currentStatusFilter = "En attente"; 

// --- Fonctions ---

/**
 * Crée l'élément HTML pour afficher un avis dans la liste de modération
 * @param {object} avis - L'objet avis
 * @returns {HTMLElement} L'élément div.card
 */
function createAvisModElement(avis) {
    const div = document.createElement('div');
    div.className = 'card mb-3';
    div.dataset.avisId = avis.id; 

    let badgeClass = 'bg-secondary';
    if (avis.statut === 'En attente') badgeClass = 'bg-warning text-dark';
    else if (avis.statut === 'Approuvé') badgeClass = 'bg-success';
    else if (avis.statut === 'Rejeté') badgeClass = 'bg-danger';

    div.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <span>Avis #${avis.id} (Covoit #${avis.covoitId || '?'})</span>
            <span class="badge ${badgeClass}">${avis.statut}</span>
        </div>
        <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Par: ${avis.auteurPseudo} | Pour: ${avis.chauffeurPseudo} | Note: ${avis.note}/5</h6>
            <p class="card-text">"${avis.commentaire}"</p>
        </div>
        {# Afficher les boutons seulement si l'avis est 'En attente' #}
        ${avis.statut === 'En attente' ? `
        <div class="card-footer text-end">
            <button class="btn btn-sm btn-success approve-btn" data-avis-id="${avis.id}">
                <i class="bi bi-check-lg"></i> Approuver
            </button>
            <button class="btn btn-sm btn-danger reject-btn" data-avis-id="${avis.id}">
                <i class="bi bi-x-lg"></i> Rejeter
            </button>
        </div>
        ` : ''}
    `;
    return div;
}

/**
 * Affiche les avis filtrés dans le conteneur
 * @param {string} statut - Le statut à filtrer ('Tous', 'En attente', 'Approuvé', 'Rejeté')
 */
function displayAvisList(statut = 'En attente') {
    console.log(`Affichage des avis avec statut: ${statut}`);
    const listContainer = document.getElementById('avis-list-container');
    if (!listContainer) return;

    currentStatusFilter = statut; 

    // Met à jour le bouton de filtre actif
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === statut);
         btn.classList.toggle('btn-primary', btn.dataset.status === statut); 
          btn.classList.toggle('btn-outline-secondary', btn.dataset.status !== statut); 
    });

    // Filtrer les données fictives
    const avisToShow = statut === 'Tous'
        ? allAvisFictifs
        : allAvisFictifs.filter(avis => avis.statut === statut);

    // Vider le conteneur
    listContainer.innerHTML = '';

    // Afficher les avis ou un message
    if (avisToShow.length > 0) {
        avisToShow.forEach(avis => {
            const avisElement = createAvisModElement(avis);
            listContainer.appendChild(avisElement);
        });
    } else {
        listContainer.innerHTML = `<p class="text-center text-muted mt-4">Aucun avis trouvé avec le statut "${statut}".</p>`;
    }
}

/**
 * Simule la mise à jour du statut d'un avis
 * @param {number} avisId - L'ID de l'avis
 * @param {string} newStatus - 'Approuvé' ou 'Rejeté'
 */
function updateAvisStatus(avisId, newStatus) {
    console.log(`Tentative de mise à jour avis ID: ${avisId} vers statut: ${newStatus}`);

    // Trouver l'avis dans nos données fictives
    const avisIndex = allAvisFictifs.findIndex(a => a.id === avisId);
    if (avisIndex === -1) {
        console.error("Avis non trouvé pour mise à jour.");
        alert("Erreur: Avis introuvable.");
        return;
    }

    // Simuler la mise à jour (dans une vraie app, ce serait fait par l'API)
    allAvisFictifs[avisIndex].statut = newStatus;
    console.log("Statut mis à jour (simulation).");

    // Rafraîchir l'affichage avec le filtre actuel pour voir le changement
    // (l'avis disparaîtra de la liste "En attente")
    displayAvisList(currentStatusFilter);

    alert(`L'avis #${avisId} a été marqué comme "${newStatus}".`);
}


// --- Initialisation et Écouteurs ---
function initializeAvisModerationPage() {
    console.log("Initialisation page modération avis...");

    const listContainer = document.getElementById('avis-list-container');
    const filterButtonsContainer = document.querySelector('.avis-filters');

    // 1. Afficher la liste initiale (avis en attente)
    displayAvisList('En attente');

    // 2. Ajouter les écouteurs pour les boutons de filtre (délégation)
    if (filterButtonsContainer) {
        filterButtonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.filter-btn');
            if (button && button.dataset.status) {
                console.log(`Clic sur filtre: ${button.dataset.status}`);
                displayAvisList(button.dataset.status); // Ré-affiche la liste avec le nouveau filtre
            }
        });
        console.log("Écouteur pour les filtres attaché.");
    }

    // 3. Ajouter les écouteurs pour Approuver/Rejeter (délégation sur le conteneur)
    if (listContainer) {
         // Utiliser un seul écouteur sur le conteneur pour gérer tous les boutons internes
        listContainer.addEventListener('click', (event) => {
            const approveButton = event.target.closest('.approve-btn');
            const rejectButton = event.target.closest('.reject-btn');
            let avisId = null;

            if (approveButton) {
                avisId = parseInt(approveButton.dataset.avisId, 10);
                console.log(`Clic sur Approuver pour ID: ${avisId}`);
                if(avisId) updateAvisStatus(avisId, 'Approuvé');
            } else if (rejectButton) {
                avisId = parseInt(rejectButton.dataset.avisId, 10);
                 console.log(`Clic sur Rejeter pour ID: ${avisId}`);
                 if(avisId) updateAvisStatus(avisId, 'Rejeté');
            }
        });
         console.log("Écouteur pour Approuver/Rejeter attaché.");
    }
}

// --- Exécution ---
initializeAvisModerationPage();
