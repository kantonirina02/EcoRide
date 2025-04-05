console.log("Exécution script account.js");

// Créer/Réutiliser le 'namespace' pour cette page
window.ecoRideAccountPage = window.ecoRideAccountPage || {};

// --- Initialisation des Données (Une seule fois par chargement complet de l'app) ---
if (!window.ecoRideAccountPage.currentUserData) {
    console.log("Initialisation des données fictives pour account.js");
    window.ecoRideAccountPage.currentUserData = {
        pseudo: "MonPseudoTest", // Devrait venir de l'API ou du token plus tard
        email: "test@example.com", // Devrait venir de l'API ou du token plus tard
        credits: window.getUserCredits ? window.getUserCredits() : 20,
        role: window.getRole ? window.getRole() : 'passenger', // Rôle initial lu depuis le cookie/API
        isDriver: false, // Sera déterminé basé sur le rôle
        driverInfo: { // Structure même si l'utilisateur n'est pas driver au début
            licensePlate: "AA-123-BB",
            firstRegistration: "2020-01-15",
            availableSeats: 3,
            preferences: { fumeur: "non_fumeur", animaux: "pas_animaux" }, // Defaults
            vehicles: [
                { id: 101, marque: "Tesla", modele: "Model 3", couleur: "Blanche", energie: "Électrique" },
                { id: 102, marque: "Peugeot", modele: "208", couleur: "Noire", energie: "Essence" }
            ],
            selectedVehicleId: 101
        },
         historiqueTrajets: [ // Historique ajouté
            { id: 15, type: 'conduit', depart: 'Bordeaux', arrivee: 'Toulouse', date: '2025-04-14', heureDepart: '09:00', prix: 22.00, statut: 'En cours', covoitId: 6 },
            { id: 10, type: 'conduit', depart: 'Paris', arrivee: 'Lyon', date: '2025-04-15', heureDepart: '08:00', prix: 25.50, statut: 'Prévu', covoitId: 1 },
            { id: 11, type: 'participe', depart: 'Marseille', arrivee: 'Nice', date: '2025-04-16', heureDepart: '10:00', prix: 15.00, statut: 'Prévu', covoitId: 3, chauffeurPseudo: 'Soleil13' },
            { id: 12, type: 'conduit', depart: 'Paris', arrivee: 'Lille', date: '2025-04-10', heureDepart: '14:00', prix: 18.00, statut: 'Terminé', covoitId: 4 },
            { id: 13, type: 'participe', depart: 'Paris', arrivee: 'Lyon', date: '2025-04-05', heureDepart: '09:30', prix: 28.00, statut: 'Terminé', covoitId: 2, chauffeurPseudo: 'VoyageurPro'},
            { id: 14, type: 'conduit', depart: 'Lyon', arrivee: 'Paris', date: '2025-04-17', heureDepart: '07:00', prix: 26.00, statut: 'Annulé', covoitId: 5 }
        ]
    };
    const initialRole = window.ecoRideAccountPage.currentUserData.role;
    window.ecoRideAccountPage.currentUserData.isDriver = (initialRole === 'driver' || initialRole === 'both');
} else {
    console.log("Données currentUserData existent déjà.");
    if (window.getUserCredits) {
        window.ecoRideAccountPage.currentUserData.credits = window.getUserCredits();
    }
     const currentRole = window.ecoRideAccountPage.currentUserData.role;
     window.ecoRideAccountPage.currentUserData.isDriver = (currentRole === 'driver' || currentRole === 'both');
}


// --- Fonctions attachées au Namespace ---

window.ecoRideAccountPage.formatDate = function(dateString) {
    if (!dateString) return '';
    try {
        const [year, month, day] = dateString.split('-');
        if (year && month && day && year.length === 4 && month.length === 2 && day.length === 2) {
             return `${day}/${month}/${year}`;
        }
    } catch (e) { /* Ignorer */ }
    return dateString;
};

// --- Fonctions de Validation ---
window.ecoRideAccountPage.validateRequiredInput = function(inputElement) {
    if (!inputElement) { console.error("validateRequiredInput: inputElement est null"); return false; }
    inputElement.classList.remove('is-valid', 'is-invalid');
    const isValid = inputElement.value.trim() !== '';
    inputElement.classList.toggle('is-valid', isValid);
    inputElement.classList.toggle('is-invalid', !isValid);
    return isValid;
};
window.ecoRideAccountPage.validateLicensePlate = function(inputElement) {
     if (!inputElement) { console.error("validateLicensePlate: inputElement est null"); return false; }
     inputElement.classList.remove('is-valid', 'is-invalid');
     const pattern = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i;
     const value = inputElement.value.trim();
     let isValid = pattern.test(value);
      if(isValid) {
         inputElement.value = value.toUpperCase();
         inputElement.classList.add("is-valid");
     } else {
         inputElement.classList.add("is-invalid");
     }
     return isValid;
};
window.ecoRideAccountPage.validateSeats = function(inputElement) {
     if (!inputElement) { console.error("validateSeats: inputElement est null"); return false; }
     inputElement.classList.remove('is-valid', 'is-invalid');
     const value = parseInt(inputElement.value, 10);
     const min = parseInt(inputElement.min, 10) || 1;
     const max = parseInt(inputElement.max, 10) || 8;
     const isValid = !isNaN(value) && value >= min && value <= max;
     inputElement.classList.toggle('is-valid', isValid);
     inputElement.classList.toggle('is-invalid', !isValid);
     return isValid;
};
window.ecoRideAccountPage.validateVehicleSelection = function(selectElement) {
     if (!selectElement) { console.error("validateVehicleSelection: selectElement est null"); return false; }
     selectElement.classList.remove('is-valid', 'is-invalid');
     const isValid = selectElement.value !== "" && selectElement.value !== null;
     selectElement.classList.toggle('is-valid', isValid);
     selectElement.classList.toggle('is-invalid', !isValid);
     return isValid;
};


// --- Fonctions de Mise à Jour de l'UI ---
window.ecoRideAccountPage.displayUserInfo = function() {
    console.log("-> Appel displayUserInfo");
    const ns = window.ecoRideAccountPage;
    const data = ns.currentUserData;
    const userPseudoSpan = document.getElementById('user-pseudo');
    const userEmailSpan = document.getElementById('user-email');
    const userCreditsSpan = document.getElementById('user-credits');

    if (userPseudoSpan) userPseudoSpan.textContent = data.pseudo || 'Non défini';
    if (userEmailSpan) userEmailSpan.textContent = data.email || 'Non défini';
    if (userCreditsSpan && window.getUserCredits) userCreditsSpan.textContent = window.getUserCredits();

    ns.updateRoleButtons(data.role);
    ns.toggleSectionsBasedOnRole(data.role);
    console.log("<- Fin displayUserInfo");
};

window.ecoRideAccountPage.populateVehicleSelect = function() {
    console.log("-> Appel populateVehicleSelect");
    const ns = window.ecoRideAccountPage;
    const data = ns.currentUserData;
    const vehicleSelect = document.getElementById('vehicleSelect');

    if (!vehicleSelect) { console.error("populateVehicleSelect: #vehicleSelect non trouvé"); return; }

    const vehicles = data.driverInfo?.vehicles;
    const selectedVehicleId = data.driverInfo?.selectedVehicleId;

    vehicleSelect.disabled = true;
    vehicleSelect.innerHTML = '<option value="" selected disabled>Aucun véhicule (non chauffeur)</option>';

    if (data.isDriver && vehicles) {
        if (vehicles.length > 0) {
             vehicleSelect.disabled = false;
             vehicleSelect.innerHTML = '<option value="" selected disabled>Sélectionner...</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.marque} ${vehicle.modele} (${vehicle.energie || '?'})`;
                if (vehicle.id === selectedVehicleId) {
                    option.selected = true;
                }
                vehicleSelect.appendChild(option);
            });
        } else {
             vehicleSelect.disabled = false;
             vehicleSelect.innerHTML = '<option value="" selected disabled>Aucun véhicule enregistré</option>';
        }
    }
    console.log("<- Fin populateVehicleSelect");
};

window.ecoRideAccountPage.populateDriverForm = function() {
     console.log("-> Appel populateDriverForm");
     const ns = window.ecoRideAccountPage;
     const data = ns.currentUserData;
     const driverInfo = data.driverInfo;
     const licensePlateInput = document.getElementById('licensePlate');
     const firstRegistrationInput = document.getElementById('firstRegistration');
     const availableSeatsInput = document.getElementById('availableSeats');

     if (!data.isDriver || !driverInfo) {
          console.log("populateDriverForm: Pas un chauffeur ou infos manquantes.");
          if(licensePlateInput) licensePlateInput.value = '';
          if(firstRegistrationInput) firstRegistrationInput.value = '';
          if(availableSeatsInput) availableSeatsInput.value = '';
          ns.populateVehicleSelect();
          return;
     }

     if (licensePlateInput) licensePlateInput.value = driverInfo.licensePlate || '';
     if (firstRegistrationInput) firstRegistrationInput.value = driverInfo.firstRegistration || '';
     if (availableSeatsInput) availableSeatsInput.value = driverInfo.availableSeats || '';

     try {
        const prefFumeur = driverInfo.preferences?.fumeur || 'non_fumeur';
        const prefAnimaux = driverInfo.preferences?.animaux || 'pas_animaux';
        const fumeurRadio = document.querySelector(`input[name="pref_fumeur"][value="${prefFumeur}"]`);
        const animauxRadio = document.querySelector(`input[name="pref_animaux"][value="${prefAnimaux}"]`);
        if (fumeurRadio) fumeurRadio.checked = true; else document.getElementById('pref_non_fumeur').checked = true; // Default check
        if (animauxRadio) animauxRadio.checked = true; else document.getElementById('pref_pas_animaux').checked = true; // Default check
    } catch (e) { console.error("Erreur pré-cochage préférences:", e); }

     ns.populateVehicleSelect();
     console.log("<- Fin populateDriverForm");
};

window.ecoRideAccountPage.updateRoleButtons = function(selectedRole) {
    console.log("updateRoleButtons appelée avec:", selectedRole);
     const passengerBtn = document.getElementById('passengerBtn');
     const driverBtn = document.getElementById('driverBtn');
     const bothBtn = document.getElementById('bothBtn');
     [passengerBtn, driverBtn, bothBtn].forEach(btn => {
         if (btn) {
             const isActive = btn.dataset.role === selectedRole;
             btn.classList.toggle('active', isActive);
             btn.classList.toggle('btn-primary', isActive);
             btn.classList.toggle('btn-outline-secondary', !isActive);
         }
     });
     console.log("<- Fin updateRoleButtons");
};

window.ecoRideAccountPage.toggleSectionsBasedOnRole = function(selectedRole) {
    console.log("toggleSectionsBasedOnRole appelée avec:", selectedRole);
    const ns = window.ecoRideAccountPage;
    const data = ns.currentUserData;
    const driverFormElement = document.getElementById('driverForm');
    const passengerSectionInfo = document.getElementById('passengerSection');
    const driverActionsDiv = document.getElementById('driverActions');
    const driverHistorySection = document.getElementById('driverHistory');
    const passengerHistorySection = document.getElementById('passengerHistory');

    data.role = selectedRole;
    data.isDriver = (selectedRole === 'driver' || selectedRole === 'both');
    console.log("Nouvel état simulé:", data);

    if (driverFormElement) {
        driverFormElement.classList.toggle('d-none', !data.isDriver);
        // Appeler populate SEULEMENT si on rend visible
        if(data.isDriver && driverFormElement.classList.contains('d-none') === false) {
             ns.populateDriverForm();
        }
        console.log("   -> d-none sur driverForm:", driverFormElement.classList.contains('d-none'));
    } else { console.error("driverFormElement non trouvé !");}

    if(driverActionsDiv){
         driverActionsDiv.classList.toggle('d-none', !data.isDriver);
         console.log("   -> d-none sur driverActionsDiv:", driverActionsDiv.classList.contains('d-none'));
    } else { console.warn("driverActionsDiv non trouvé!");}

     if (passengerSectionInfo) {
        const showPassengerInfo = selectedRole === 'passenger' || selectedRole === 'both';
        passengerSectionInfo.classList.toggle('d-none', !showPassengerInfo);
        console.log("   -> d-none sur passengerSectionInfo:", passengerSectionInfo.classList.contains('d-none'));
    } else { console.error("passengerSection non trouvé !");}

     if(driverHistorySection){
         driverHistorySection.classList.toggle('d-none', !data.driverInfo);
         console.log("   -> d-none sur driverHistorySection:", driverHistorySection.classList.contains('d-none'));
     } else { console.warn("driverHistorySection non trouvé!");}

      if(passengerHistorySection){
          passengerHistorySection.classList.toggle('d-none', false);
          console.log("   -> d-none sur passengerHistorySection:", passengerHistorySection.classList.contains('d-none'));
      } else { console.warn("passengerHistorySection non trouvé!");}

    console.log("<- Fin toggleSectionsBasedOnRole");
};

// --- Fonctions de Gestion des Actions ---
window.ecoRideAccountPage.handleCancelTrajet = function(historyId, type) { /* ... (Code identique à la version précédente) ... */ };
window.ecoRideAccountPage.handleStartTrajet = function(historyId) { /* ... (Code identique à la version précédente) ... */ };
window.ecoRideAccountPage.handleFinishTrajet = function(historyId) { /* ... (Code identique à la version précédente) ... */ };


// --- Affichage Historique (avec délégation et createHistoryElement interne) ---
window.ecoRideAccountPage.displayHistorique = function() {
    console.log("-> Appel displayHistorique");
    const ns = window.ecoRideAccountPage;
    const data = ns.currentUserData;
    const historique = data.historiqueTrajets || [];
    const driverHistoryContent = document.getElementById('driver-history-content');
    const passengerHistoryContent = document.getElementById('passenger-history-content');

    if (!driverHistoryContent || !passengerHistoryContent) { console.error("Conteneurs historique non trouvés."); return; }
    driverHistoryContent.innerHTML = '';
    passengerHistoryContent.innerHTML = '';

    // --- Définition de createHistoryElement ICI ---
    const createHistoryElement = (trajet, type) => {
        const elem = document.createElement('div');
        elem.className = 'list-group-item list-group-item-action flex-column align-items-start';
        let statutBadge = '';
        switch (trajet.statut) {
             case 'Prévu': statutBadge = '<span class="badge bg-info float-end">Prévu</span>'; break;
             case 'En cours': statutBadge = '<span class="badge bg-warning text-dark float-end">En cours</span>'; break;
             case 'Terminé': statutBadge = '<span class="badge bg-secondary float-end">Terminé</span>'; break;
             case 'Annulé': statutBadge = '<span class="badge bg-danger float-end">Annulé</span>'; break;
             default: statutBadge = `<span class="badge bg-light text-dark float-end">${trajet.statut || '?'}</span>`;
        }
        const isPrevu = trajet.statut === 'Prévu';
        const isEnCours = trajet.statut === 'En cours';
        const isTermine = trajet.statut === 'Terminé';

        const detailLink = `<a href="/covoiturages/${trajet.covoitId}" data-link class="btn btn-sm btn-outline-primary me-2">Voir Détails</a>`;
        let actionButtons = '';

        if (type === 'conduit') {
             if (isPrevu) {
                actionButtons += `<button class="btn btn-sm btn-success start-btn me-2" data-history-id="${trajet.id}"><i class="bi bi-play-fill"></i> Démarrer</button>`;
                actionButtons += `<button class="btn btn-sm btn-outline-danger cancel-btn" data-history-id="${trajet.id}" data-type="conduit"><i class="bi bi-x-circle"></i> Annuler</button>`;
            } else if (isEnCours) {
                actionButtons += `<button class="btn btn-sm btn-info finish-btn" data-history-id="${trajet.id}"><i class="bi bi-check-circle-fill"></i> Arrivée</button>`;
            } else if (isTermine) {
                 actionButtons += `<button class="btn btn-sm btn-outline-secondary history-details-btn" data-history-id="${trajet.id}" disabled title="Voir participants/avis (à venir)"><i class="bi bi-people"></i> Gérer</button>`;
            }
        } else { // type === 'participe'
            if (isPrevu) {
                actionButtons += `<button class="btn btn-sm btn-outline-danger cancel-btn" data-history-id="${trajet.id}" data-type="participe"><i class="bi bi-x-circle"></i> Annuler Participation</button>`;
            } else if (isTermine) {
                 actionButtons += `<button class="btn btn-sm btn-outline-warning feedback-btn" data-history-id="${trajet.id}" disabled title="Laisser avis/validation (à venir)"><i class="bi bi-chat-left-text"></i> Feedback</button>`;
            }
        }

        elem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${trajet.depart} <i class="bi bi-arrow-right-short"></i> ${trajet.arrivee} ${type === 'participe' ? `(avec ${trajet.chauffeurPseudo || '?'})` : ''}</h6>
                <small>${ns.formatDate(trajet.date)} à ${trajet.heureDepart}</small>
            </div>
            <p class="mb-1 small">Prix: ${trajet.prix.toFixed(2)}€ ${statutBadge}</p>
            <div class="mt-2 history-actions">
                ${detailLink}
                ${actionButtons}
            </div>
        `;
        return elem;
    };
    // --- Fin createHistoryElement ---


    // Peupler les listes
    const trajetsConduits = historique.filter(t => t.type === 'conduit');
    const trajetsParticipations = historique.filter(t => t.type === 'participe');

    if (trajetsConduits.length > 0) {
        trajetsConduits.forEach(t => driverHistoryContent.appendChild(createHistoryElement(t, 'conduit')));
    } else { driverHistoryContent.innerHTML = '<p class="text-muted list-group-item">Aucun trajet proposé.</p>'; }

    if (trajetsParticipations.length > 0) {
        trajetsParticipations.forEach(t => passengerHistoryContent.appendChild(createHistoryElement(t, 'participe')));
    } else { passengerHistoryContent.innerHTML = '<p class="text-muted list-group-item">Aucune participation.</p>'; }


    // --- Attacher/Ré-attacher les écouteurs pour les actions d'historique ---
    const historyEventHandler = (event) => {
        const button = event.target.closest('button[data-history-id]');
        if (!button) return;
        console.log("Clic détecté sur bouton d'historique:", button);

        const historyId = parseInt(button.dataset.historyId, 10);
        const type = button.dataset.type;

        if (button.classList.contains('cancel-btn') && historyId && type) {
            console.log(`Action détectée: Annuler (ID: ${historyId}, Type: ${type})`);
            ns.handleCancelTrajet(historyId, type);
        } else if (button.classList.contains('start-btn') && historyId) {
            console.log(`Action détectée: Démarrer (ID: ${historyId})`);
            ns.handleStartTrajet(historyId);
        }
        else if (button.classList.contains('finish-btn') && historyId) {
            console.log(`Action détectée: Terminer (ID: ${historyId})`); 
            ns.handleFinishTrajet(historyId);
        }
        else {
            console.log("Aucune action connue pour ce bouton:", button); 
        }
    };

    const setupHistoryListeners = (container) => {
         if(container) {
            container.removeEventListener('click', historyEventHandler);
            container.addEventListener('click', historyEventHandler);
            console.log(`Écouteur d'actions (historyEventHandler) attaché à ${container.id}`);
         } else {
            console.error("Conteneur d'historique non trouvé pour attacher l'écouteur:", container);
        }
    };

    setupHistoryListeners(driverHistoryContent);
    setupHistoryListeners(passengerHistoryContent);

    console.log("<- Fin displayHistorique");
};


// --- Fonction d'Attachement des Écouteurs (appelée une seule fois) ---
window.ecoRideAccountPage.attachEventListeners = function() {
    console.log("Attachement des écouteurs UNIQUES page Account...");
    const ns = window.ecoRideAccountPage;
    const passengerBtn = document.getElementById('passengerBtn');
    const driverBtn = document.getElementById('driverBtn');
    const bothBtn = document.getElementById('bothBtn');
    const driverFormElement = document.getElementById('driverForm');
    const driverFormFeedback = document.getElementById('driver-form-feedback');
    // Cibler les champs pour la validation DANS l'écouteur submit
    const licensePlateInput = document.getElementById('licensePlate');
    const firstRegistrationInput = document.getElementById('firstRegistration');
    const availableSeatsInput = document.getElementById('availableSeats');
    const vehicleSelect = document.getElementById('vehicleSelect');


    const attachListenerIfNeeded = (element, eventName, handler, idSuffix) => {
        const listenerId = 'data-listener-' + eventName + (idSuffix || '');
        if (element && !element.hasAttribute(listenerId)) {
            element.addEventListener(eventName, handler);
            element.setAttribute(listenerId, 'true');
            console.log(`Écouteur '${eventName}' attaché pour`, element.id || element);
            return true;
        } else if (element) { return false; } // Déjà attaché, on log plus ici pour éviter spam
          else { console.error(`Élément non trouvé pour attacher '${eventName}'`); return false; }
    };

    // Attacher aux boutons de rôle
    attachListenerIfNeeded(passengerBtn, 'click', () => { ns.updateRoleButtons('passenger'); ns.toggleSectionsBasedOnRole('passenger'); });
    attachListenerIfNeeded(driverBtn, 'click', () => { ns.updateRoleButtons('driver'); ns.toggleSectionsBasedOnRole('driver'); });
    attachListenerIfNeeded(bothBtn, 'click', () => { ns.updateRoleButtons('both'); ns.toggleSectionsBasedOnRole('both'); });


    // Attacher au formulaire chauffeur
    attachListenerIfNeeded(driverFormElement, 'submit', (event) => {
         event.preventDefault();
         console.log("Soumission formulaire chauffeur...");
         if (driverFormFeedback) { driverFormFeedback.textContent = ''; driverFormFeedback.className = 'mb-3'; }

         console.log("Validation formulaire chauffeur...");
         let isFormValid = true;
         isFormValid = ns.validateLicensePlate(licensePlateInput) && isFormValid;
         isFormValid = ns.validateRequiredInput(firstRegistrationInput) && isFormValid;
         isFormValid = ns.validateVehicleSelection(vehicleSelect) && isFormValid;
         isFormValid = ns.validateSeats(availableSeatsInput) && isFormValid;

         if (isFormValid) {
            console.log("Formulaire chauffeur VALIDE.");
            const data = ns.currentUserData.driverInfo;
            if(data){ // Sécurité: vérifier que driverInfo existe
                data.licensePlate = licensePlateInput.value;
                data.firstRegistration = firstRegistrationInput.value;
                data.selectedVehicleId = parseInt(vehicleSelect.value, 10);
                data.availableSeats = parseInt(availableSeatsInput.value, 10);
                 if(data.preferences){
                      data.preferences.fumeur = document.querySelector('input[name="pref_fumeur"]:checked')?.value;
                      data.preferences.animaux = document.querySelector('input[name="pref_animaux"]:checked')?.value;
                  }
                 console.log("Données MàJ:", data);
                 if (driverFormFeedback) {
                    driverFormFeedback.textContent = 'Infos enregistrées (simulation) !';
                    driverFormFeedback.className = 'alert alert-success mt-3';
                    setTimeout(() => { if(driverFormFeedback) { driverFormFeedback.textContent = ''; driverFormFeedback.className = 'mb-3'; } }, 3000);
                 }
            } else {
                 console.error("Impossible de sauvegarder: currentUserData.driverInfo non défini.");
                  if (driverFormFeedback) {
                     driverFormFeedback.textContent = 'Erreur interne lors de la sauvegarde.';
                     driverFormFeedback.className = 'alert alert-danger mt-3';
                  }
            }

         } else {
            console.log("Formulaire chauffeur INVALIDE.");
              if (driverFormFeedback) {
                 driverFormFeedback.textContent = 'Veuillez corriger les erreurs.';
                 driverFormFeedback.className = 'alert alert-danger mt-3';
             }
         }
    });
    console.log("Fin attachement écouteurs page Account.");
};


// --- Initialisation de la Page ---
window.ecoRideAccountPage.initialize = function() {
    const ns = window.ecoRideAccountPage; // Alias

    if (ns.isInitialized && document.getElementById('account-page-marker')) { // Ajout d'un marqueur pour être sûr
        console.log("Page Account déjà initialisée, mise à jour infos...");
        const userCreditsSpan = document.getElementById('user-credits');
        if (userCreditsSpan && window.getUserCredits) userCreditsSpan.textContent = window.getUserCredits();
        ns.updateRoleButtons(ns.currentUserData.role);
        ns.toggleSectionsBasedOnRole(ns.currentUserData.role);
        ns.displayHistorique(); // Rafraîchir historique
        return;
    }
    console.log("Première initialisation de la page Account.");
    // Ajouter un marqueur au conteneur principal pour la détection isInitialized
    const mainContainer = document.querySelector('.account-page'); // Utilise la classe du conteneur principal
    if (mainContainer) mainContainer.id = 'account-page-marker';


    if (!window.isConnected()) { console.warn("Non connecté, redirection..."); window.location.replace("/signin"); return; }

    // Afficher infos initiales + historique
    ns.displayUserInfo();
    ns.displayHistorique();

    // Attacher les écouteurs une seule fois
    ns.attachEventListeners();

    ns.isInitialized = true; // Marquer comme initialisé
    console.log("Page Account marquée comme initialisée.");
};

// --- Exécution ---
window.ecoRideAccountPage.initialize();
