console.log("Exécution script avis_moderation.js");

// --- Données Fictives Avis ---
let allAvisFictifs = [
    { id: 101, covoitId: 1, auteurPseudo: "Passager1", chauffeurPseudo: "ChauffeurCool75", note: 5, commentaire: "Trajet parfait, conduite très agréable !", statut: "Approuvé" },
    { id: 102, covoitId: 1, auteurPseudo: "Passager2", chauffeurPseudo: "ChauffeurCool75", note: 4, commentaire: "Bon conducteur, voiture propre.", statut: "Approuvé" },
    { id: 103, covoitId: 2, auteurPseudo: "Passager3", chauffeurPseudo: "VoyageurPro", note: 4, commentaire: "Bien, mais un peu de retard.", statut: "En attente" },
    { id: 104, covoitId: 3, auteurPseudo: "Passager4", chauffeurPseudo: "Soleil13", note: 5, commentaire: "Super sympa et arrangeant !", statut: "Approuvé" },
    { id: 105, covoitId: 3, auteurPseudo: "Passager5", chauffeurPseudo: "Soleil13", note: 5, commentaire: "Conduite impeccable, je recommande.", statut: "Approuvé" },
    { id: 106, covoitId: 3, auteurPseudo: "Passager6", chauffeurPseudo: "Soleil13", note: 5, commentaire: "Ponctuel et agréable.", statut: "Approuvé" },
    { id: 107, covoitId: 4, auteurPseudo: "Passager7", chauffeurPseudo: "NordisteRapide", note: 2, commentaire: "Conduite dangereuse et voiture sale.", statut: "En attente" },
    { id: 108, covoitId: 5, auteurPseudo: "Passager8", chauffeurPseudo: "RetourParis", note: 1, commentaire: "Ne s'est jamais présenté !", statut: "Rejeté" },
    { id: 109, covoitId: 1, auteurPseudo: "Passager9", chauffeurPseudo: "ChauffeurCool75", note: 5, commentaire: "Excellent !", statut: "En attente" },
];

// --- Données Fictives Trajets Signalés ---
const reportedTripsFictifs = [
    { covoitId: 2, signalementId: 501, passager: { pseudo: "Passager3", email: "p3@example.com" }, chauffeur: { pseudo: "VoyageurPro", email: "vp@example.com" }, trajet: { depart: "Paris", arrivee: "Lyon", date: "2025-04-05", heure: "09:30" }, raison: "Chauffeur très en retard sans prévenir, conduite un peu agressive.", statutSignalement: "A traiter" },
    { covoitId: 4, signalementId: 502, passager: { pseudo: "Passager7", email: "p7@example.com" }, chauffeur: { pseudo: "NordisteRapide", email: "nr@example.com" }, trajet: { depart: "Paris", arrivee: "Lille", date: "2025-04-10", heure: "14:00" }, raison: "Le véhicule ne correspondait pas à celui annoncé et n'était pas très propre.", statutSignalement: "A traiter" }
];

let currentStatusFilter = "En attente";

// --- Fonctions ---

// +++ AJOUT DE LA FONCTION formatDate ICI +++
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const [year, month, day] = dateString.split('-');
        if (year && month && day && year.length === 4 && month.length === 2 && day.length === 2) {
             return `${day}/${month}/${year}`;
        }
    } catch (e) { /* Ignorer */ }
    return dateString;
}
// +++ FIN AJOUT +++

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

function displayAvisList(statut = 'En attente') {
    console.log(`Affichage des avis avec statut: ${statut}`);
    const listContainer = document.getElementById('avis-list-container');
    if (!listContainer) return;
    currentStatusFilter = statut;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        const isActive = btn.dataset.status === statut;
        btn.classList.toggle('active', isActive); // Pour ton style .active si tu en as un
        btn.classList.toggle('btn-primary', isActive); // Style Bootstrap pour actif
        btn.classList.toggle('btn-outline-secondary', !isActive); // Style Bootstrap pour inactif
    });

    const avisToShow = statut === 'Tous' ? allAvisFictifs : allAvisFictifs.filter(avis => avis.statut === statut);
    listContainer.innerHTML = '';

    if (avisToShow.length > 0) {
        avisToShow.forEach(avis => listContainer.appendChild(createAvisModElement(avis)));
    } else {
        listContainer.innerHTML = `<p class="text-center text-muted mt-4">Aucun avis trouvé avec le statut "${statut}".</p>`;
    }
}

function updateAvisStatus(avisId, newStatus) {
    console.log(`Tentative MàJ avis ID: ${avisId} -> ${newStatus}`);
    const avisIndex = allAvisFictifs.findIndex(a => a.id === avisId);
    if (avisIndex === -1) { /* ... erreur ... */ return; }

    allAvisFictifs[avisIndex].statut = newStatus;
    console.log("Statut mis à jour (simulation).");
    displayAvisList(currentStatusFilter); // Rafraîchir la vue actuelle
    alert(`L'avis #${avisId} a été marqué comme "${newStatus}".`);
}

function displayReportedTrips() {
    console.log("Affichage des trajets signalés...");
    const contentDiv = document.getElementById('reported-trips-content');
    if (!contentDiv) { /* ... erreur ... */ return; }

    const tripsToDisplay = reportedTripsFictifs.filter(trip => trip.statutSignalement === 'A traiter');
    contentDiv.innerHTML = '';

    if (tripsToDisplay.length > 0) {
        const table = document.createElement('table');
        table.className = 'table table-sm table-bordered table-hover';
        table.innerHTML = `
            <thead class="table-light">
                <tr><th>Covoit ID</th><th>Trajet</th><th>Date</th><th>Passager</th><th>Chauffeur</th><th>Raison</th><th>Actions</th></tr>
            </thead>
            <tbody>
                ${tripsToDisplay.map(trip => `
                    <tr>
                        <td>${trip.covoitId}</td>
                        <td>${trip.trajet.depart} -> ${trip.trajet.arrivee}</td>
                        <td>${formatDate(trip.trajet.date)} ${trip.trajet.heure}</td> {# Appel formatDate local #}
                        <td>${trip.passager.pseudo} (${trip.passager.email})</td>
                        <td>${trip.chauffeur.pseudo} (${trip.chauffeur.email})</td>
                        <td>${trip.raison}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary" disabled>Contacter</button>
                            <button class="btn btn-sm btn-outline-success" data-signalement-id="${trip.signalementId}" disabled>Résolu</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        contentDiv.appendChild(table);
    } else {
        contentDiv.innerHTML = '<p class="text-center text-muted">Aucun trajet signalé à traiter.</p>';
    }
     console.log("<- Fin displayReportedTrips");
}

// --- Initialisation et Écouteurs ---
function initializeAvisModerationPage() {
    console.log("Initialisation page modération avis...");
    const listContainer = document.getElementById('avis-list-container');
    const filterButtonsContainer = document.querySelector('.avis-filters');

    displayAvisList('En attente'); // Affichage initial
    displayReportedTrips();     // Afficher trajets signalés

    // Écouteur pour les filtres
    if (filterButtonsContainer) {
        filterButtonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.filter-btn');
            if (button?.dataset.status) displayAvisList(button.dataset.status);
        });
        console.log("Écouteur filtres attaché.");
    }

    // Écouteur pour Approuver/Rejeter
    if (listContainer) {
        listContainer.addEventListener('click', (event) => {
            const approveButton = event.target.closest('.approve-btn');
            const rejectButton = event.target.closest('.reject-btn');
            let avisId = null;
            if (approveButton) {
                avisId = parseInt(approveButton.dataset.avisId, 10);
                if(avisId) updateAvisStatus(avisId, 'Approuvé');
            } else if (rejectButton) {
                avisId = parseInt(rejectButton.dataset.avisId, 10);
                 if(avisId) updateAvisStatus(avisId, 'Rejeté');
            }
        });
         console.log("Écouteur Approuver/Rejeter attaché.");
    }
    // TODO: Ajouter listener pour les boutons des trajets signalés si besoin
}

// --- Exécution ---
initializeAvisModerationPage();
