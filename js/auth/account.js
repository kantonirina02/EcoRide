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
            licensePlate: null,
            firstRegistration: null,
            availableSeats: null,
            preferences: { fumeur: "non_fumeur", animaux: "pas_animaux" }, // Defaults
            vehicles: [
                { id: 101, marque: "Tesla", modele: "Model 3", couleur: "Blanche", energie: "Électrique" },
                { id: 102, marque: "Peugeot", modele: "208", couleur: "Noire", energie: "Essence" }
            ],
            selectedVehicleId: null // Pas de sélection par défaut forcément
        },
         historiqueTrajets: [ // Historique ajouté
            { id: 10, type: 'conduit', depart: 'Paris', arrivee: 'Lyon', date: '2025-04-15', heureDepart: '08:00', prix: 25.50, statut: 'Prévu', covoitId: 1 },
            { id: 11, type: 'participe', depart: 'Marseille', arrivee: 'Nice', date: '2025-04-16', heureDepart: '10:00', prix: 15.00, statut: 'Prévu', covoitId: 3, chauffeurPseudo: 'Soleil13' },
            { id: 12, type: 'conduit', depart: 'Paris', arrivee: 'Lille', date: '2025-04-10', heureDepart: '14:00', prix: 18.00, statut: 'Terminé', covoitId: 4 },
            { id: 13, type: 'participe', depart: 'Paris', arrivee: 'Lyon', date: '2025-04-05', heureDepart: '09:30', prix: 28.00, statut: 'Terminé', covoitId: 2, chauffeurPseudo: 'VoyageurPro'},
            { id: 14, type: 'conduit', depart: 'Lyon', arrivee: 'Paris', date: '2025-04-17', heureDepart: '07:00', prix: 26.00, statut: 'Annulé', covoitId: 5 }
        ]
    };
    // Déterminer isDriver basé sur le rôle initial chargé
    const initialRole = window.ecoRideAccountPage.currentUserData.role;
    window.ecoRideAccountPage.currentUserData.isDriver = (initialRole === 'driver' || initialRole === 'both');
    // Charger les infos chauffeur existantes si le rôle initial est driver/both
    // TODO: Idéalement, ces infos viendraient d'une API lors du chargement initial

} else {
    console.log("Données currentUserData existent déjà.");
    // Mettre à jour seulement les crédits (qui peuvent changer dynamiquement)
    if (window.getUserCredits) {
        window.ecoRideAccountPage.currentUserData.credits = window.getUserCredits();
    }
     // S'assurer que isDriver est cohérent avec le rôle stocké
     const currentRole = window.ecoRideAccountPage.currentUserData.role;
     window.ecoRideAccountPage.currentUserData.isDriver = (currentRole === 'driver' || currentRole === 'both');
}


// --- Fonctions attachées au Namespace ---

window.ecoRideAccountPage.formatDate = function(dateString) {
    if (!dateString) return '';
    try {
        const [year, month, day] = dateString.split('-');
        // Vérification simple si le découpage a fonctionné
        if (year && month && day && year.length === 4 && month.length === 2 && day.length === 2) {
             return `${day}/${month}/${year}`;
        }
    } catch (e) { /* Ignorer l'erreur de format */ }
    return dateString; // Retourne original si format invalide
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
         inputElement.value = value.toUpperCase(); // Met en majuscules si valide
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
     const isValid = selectElement.value !== "" && selectElement.value !== null; // Doit avoir une valeur sélectionnée
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
    if (userCreditsSpan && window.getUserCredits) userCreditsSpan.textContent = window.getUserCredits(); // Toujours prendre la valeur fraîche

    // Appeler les fonctions de mise à jour visuelle qui dépendent du rôle initial
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

    const vehicles = data.driverInfo?.vehicles; // Utilise ?. au cas où driverInfo n'existerait pas
    const selectedVehicleId = data.driverInfo?.selectedVehicleId;

    // Vider les options précédentes sauf la première (placeholder)
    while (vehicleSelect.options.length > 1) {
        vehicleSelect.remove(1);
    }
    vehicleSelect.value = ""; // Réinitialiser la sélection
    vehicleSelect.disabled = true; // Désactiver par défaut

    if (data.isDriver && vehicles) { // Vérifie si chauffeur ET si l'array vehicles existe
        if (vehicles.length > 0) {
             vehicleSelect.disabled = false;
             vehicleSelect.innerHTML = '<option value="" selected disabled>Sélectionner...</option>'; // Remet le placeholder
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
             vehicleSelect.disabled = false; // Laisser activé pour ajout futur?
             vehicleSelect.innerHTML = '<option value="" selected disabled>Aucun véhicule enregistré</option>';
        }
    } else {
         vehicleSelect.innerHTML = '<option value="" selected disabled>N/A (non chauffeur)</option>';
    }
    console.log("<- Fin populateVehicleSelect");
};

window.ecoRideAccountPage.populateDriverForm = function() {
     console.log("-> Appel populateDriverForm");
     const ns = window.ecoRideAccountPage;
     const data = ns.currentUserData;
     const driverInfo = data.driverInfo; // Peut être null/undefined si pas chauffeur
     // Cibler les éléments
     const licensePlateInput = document.getElementById('licensePlate');
     const firstRegistrationInput = document.getElementById('firstRegistration');
     const availableSeatsInput = document.getElementById('availableSeats');

     if (!data.isDriver || !driverInfo) {
          console.log("populateDriverForm: Pas un chauffeur ou infos manquantes.");
          // Optionnel: vider les champs s'ils ne sont pas pertinents
          if(licensePlateInput) licensePlateInput.value = '';
          if(firstRegistrationInput) firstRegistrationInput.value = '';
          if(availableSeatsInput) availableSeatsInput.value = '';
          ns.populateVehicleSelect(); // Assure que le select est dans l'état correct
          return;
     }

     if (licensePlateInput) licensePlateInput.value = driverInfo.licensePlate || '';
     if (firstRegistrationInput) firstRegistrationInput.value = driverInfo.firstRegistration || '';
     if (availableSeatsInput) availableSeatsInput.value = driverInfo.availableSeats || '';

     try {
        const prefFumeur = driverInfo.preferences?.fumeur || 'non_fumeur'; // Valeur par défaut si undefined
        const prefAnimaux = driverInfo.preferences?.animaux || 'pas_animaux'; // Valeur par défaut si undefined
        document.querySelector(`input[name="pref_fumeur"][value="${prefFumeur}"]`).checked = true;
        document.querySelector(`input[name="pref_animaux"][value="${prefAnimaux}"]`).checked = true;
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
    // Cible les éléments
    const driverFormElement = document.getElementById('driverForm');
    const passengerSectionInfo = document.getElementById('passengerSection');
    const driverActionsDiv = document.getElementById('driverActions');
    const driverHistorySection = document.getElementById('driverHistory');
    const passengerHistorySection = document.getElementById('passengerHistory');

    // Mettre à jour l'état
    data.role = selectedRole;
    data.isDriver = (selectedRole === 'driver' || selectedRole === 'both');
    console.log("Nouvel état simulé:", data);

    // Appliquer la visibilité
    if (driverFormElement) driverFormElement.classList.toggle('d-none', !data.isDriver);
    if (driverActionsDiv) driverActionsDiv.classList.toggle('d-none', !data.isDriver);
    if (passengerSectionInfo) passengerSectionInfo.classList.toggle('d-none', !(selectedRole === 'passenger' || selectedRole === 'both'));
    if (driverHistorySection) driverHistorySection.classList.toggle('d-none', !data.driverInfo); // Affiche si driverInfo existe
    if (passengerHistorySection) passengerHistorySection.classList.toggle('d-none', false); // Toujours visible

    // Pré-remplir si besoin
    if (data.isDriver && driverFormElement && !driverFormElement.classList.contains('d-none')) {
        ns.populateDriverForm();
    }

    console.log("<- Fin toggleSectionsBasedOnRole");
};

// --- NOUVELLE FONCTION : Gérer l'Annulation ---
window.ecoRideAccountPage.handleCancelTrajet = function(historyId, type) {
    console.log(`Tentative d'annulation pour historique ID: ${historyId}, type: ${type}`);
    const ns = window.ecoRideAccountPage;
    const data = ns.currentUserData;
    const historique = data.historiqueTrajets || [];

    // Trouver l'entrée d'historique correspondante
    const trajetIndex = historique.findIndex(t => t.id === historyId);
    if (trajetIndex === -1) {
        console.error("Trajet historique non trouvé pour annulation.");
        alert("Erreur : Trajet historique introuvable.");
        return;
    }

    const trajet = historique[trajetIndex];

    // Vérifier si le statut permet l'annulation
    if (trajet.statut !== 'Prévu') {
        console.warn("Tentative d'annulation d'un trajet non prévu.");
        alert("Vous ne pouvez annuler qu'un trajet prévu.");
        return;
    }

    // Confirmation utilisateur
    const confirmationMessage = type === 'conduit'
        ? `Confirmez-vous l'annulation du trajet ${trajet.depart} -> ${trajet.arrivee} du ${ns.formatDate(trajet.date)} ?\n(Les passagers inscrits seraient remboursés et notifiés).`
        : `Confirmez-vous l'annulation de votre participation au trajet ${trajet.depart} -> ${trajet.arrivee} du ${ns.formatDate(trajet.date)} ?\n(Vos crédits vous seront remboursés).`;

    if (window.confirm(confirmationMessage)) {
        console.log("Annulation confirmée.");

        // --- Simulation Backend ---
        // 1. Changer le statut
        trajet.statut = 'Annulé';
        console.log("Statut mis à jour en 'Annulé' (simulation).");

        // 2. Simuler le remboursement des crédits
        let creditsToAdd = 0;
        if (type === 'participe') {
            creditsToAdd = Math.ceil(trajet.prix); // Rembourse le passager
        } else if (type === 'conduit') {
            // Si c'était une vraie app, on chercherait les passagers inscrits
            // et on rembourserait chacun. Ici on simule juste qu'il n'y avait
            // pas de passager ou que le remboursement est géré ailleurs pour le chauffeur.
            // On pourrait aussi enlever les 2 crédits pris par la plateforme ? Non, c'est au backend de gérer ça.
            console.log("Annulation par le chauffeur (pas de remboursement simulé ici).");
        }

        if (creditsToAdd > 0) {
            if (window.addUserCredits) {
                window.addUserCredits(creditsToAdd);
                // Mettre à jour l'affichage des crédits en haut de page
                 const userCreditsSpan = document.getElementById('user-credits');
                 if(userCreditsSpan && window.getUserCredits) userCreditsSpan.textContent = window.getUserCredits();
            } else {
                console.error("Fonction addUserCredits non trouvée !");
            }
        }

        // 3. Afficher un message de succès
        alert("Le trajet a été annulé avec succès."); // Simple alerte pour la démo

        // 4. Rafraîchir l'affichage de l'historique complet
        ns.displayHistorique();

    } else {
        console.log("Annulation abandonnée par l'utilisateur.");
    }
}


// --- Affichage Historique ---
window.ecoRideAccountPage.displayHistorique = function() {
    console.log("-> Appel displayHistorique");
    const ns = window.ecoRideAccountPage;
    const data = ns.currentUserData;
    const historique = data.historiqueTrajets || [];
    const driverHistoryContent = document.getElementById('driver-history-content');
    const passengerHistoryContent = document.getElementById('passenger-history-content');

    if (!driverHistoryContent || !passengerHistoryContent) { return; }

    driverHistoryContent.innerHTML = '';
    passengerHistoryContent.innerHTML = '';

    const trajetsConduits = historique.filter(t => t.type === 'conduit');
    const trajetsParticipations = historique.filter(t => t.type === 'participe');

    // Fonction interne pour créer un élément d'historique
    const createHistoryElement = (trajet, type) => {
        const elem = document.createElement('div');
        elem.className = 'list-group-item list-group-item-action flex-column align-items-start';
        let statutBadge = '';
        switch (trajet.statut) { /* ... badges ... */ }
        const isPrevu = trajet.statut === 'Prévu';
        const detailLink = `<a href="/covoiturages/${trajet.covoitId}" data-link class="btn btn-sm btn-outline-primary me-2">Voir Détails</a>`;
        let cancelButton = '';
        if (isPrevu) {
            cancelButton = `<button class="btn btn-sm btn-outline-danger cancel-btn" data-history-id="${trajet.id}" data-type="${type}"> ${type === 'conduit' ? 'Annuler Trajet' : 'Annuler Participation'} </button>`;
        }
         let driverSpecificActions = '';
         if (type === 'conduit' && isPrevu) {
             // TODO US 11: Ajouter boutons Démarrer/Arrêter ici
             // driverSpecificActions = `<button...>Démarrer</button>...`;
         }
         let passengerSpecificActions = '';
          if (type === 'participe' && trajet.statut === 'Terminé') {
               // TODO US 11: Ajouter bouton Avis ici
              // passengerSpecificActions = `<button...>Laisser Avis</button>`;
          }

        elem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${trajet.depart} <i class="bi bi-arrow-right-short"></i> ${trajet.arrivee} ${type === 'participe' ? `(avec ${trajet.chauffeurPseudo || '?'})` : ''}</h6>
                <small>${ns.formatDate(trajet.date)} à ${trajet.heureDepart}</small>
            </div>
            <p class="mb-1 small">Prix: ${trajet.prix.toFixed(2)}€ ${statutBadge}</p>
            <div class="mt-2">
                ${detailLink}
                ${cancelButton}
                ${driverSpecificActions}
                ${passengerSpecificActions}
            </div>
        `;
        return elem;
    };

    // Peupler les listes
    if (trajetsConduits.length > 0) {
        trajetsConduits.forEach(t => driverHistoryContent.appendChild(createHistoryElement(t, 'conduit')));
    } else {}
    if (trajetsParticipations.length > 0) {
        trajetsParticipations.forEach(t => passengerHistoryContent.appendChild(createHistoryElement(t, 'participe')));
    } else {}

    console.log("<- Fin displayHistorique");
    // Attacher les écouteurs aux boutons Annuler
    const attachCancelListener = (container) => {
        container.removeEventListener('click', cancelEventHandler);
        container.addEventListener('click', cancelEventHandler);
        console.log(`Écouteur d'annulation attaché à ${container.id}`);
};
// Fonction qui gère le clic sur un bouton Annuler
const cancelEventHandler = (event) => {
    // Vérifier si on a cliqué sur un bouton avec la classe 'cancel-btn'
    if (event.target.classList.contains('cancel-btn')) {
        const button = event.target;
        const historyId = parseInt(button.dataset.historyId, 10); // Récupère l'ID depuis data-history-id
        const type = button.dataset.type; // Récupère le type depuis data-type
        if (historyId && type) {
            ns.handleCancelTrajet(historyId, type); // Appelle la fonction du namespace
        } else {
            console.error("Impossible de récupérer l'ID ou le type pour l'annulation.");
        }
    }
};

// Attacher les écouteurs aux deux conteneurs
if (driverHistoryContent) attachCancelListener(driverHistoryContent);
if (passengerHistoryContent) attachCancelListener(passengerHistoryContent);
};

// --- Fonction d'Attachement des Écouteurs (appelée une seule fois) ---
window.ecoRideAccountPage.attachEventListeners = function() {
    console.log("Attachement des écouteurs page Account...");
    const ns = window.ecoRideAccountPage;
    const passengerBtn = document.getElementById('passengerBtn');
    const driverBtn = document.getElementById('driverBtn');
    const bothBtn = document.getElementById('bothBtn');
    const driverFormElement = document.getElementById('driverForm');
    const driverFormFeedback = document.getElementById('driver-form-feedback');
    // Cibler les champs pour la validation dans le listener submit
    const licensePlateInput = document.getElementById('licensePlate');
    const firstRegistrationInput = document.getElementById('firstRegistration');
    const availableSeatsInput = document.getElementById('availableSeats');
    const vehicleSelect = document.getElementById('vehicleSelect');


    const attachListenerIfNeeded = (element, eventName, handler) => {
        if (element && !element.hasAttribute('data-listener-' + eventName)) {
            element.addEventListener(eventName, handler);
            element.setAttribute('data-listener-' + eventName, 'true');
            return true; // Indique que l'écouteur a été attaché
        } else if (element) {
            console.log(`Écouteur '${eventName}' déjà attaché pour`, element.id || element);
            return false; // Déjà attaché
        } else {
            console.error(`Élément non trouvé pour attacher '${eventName}'`);
            return false; // Élément non trouvé
        }
    };

    // Attacher aux boutons de rôle
    if(attachListenerIfNeeded(passengerBtn, 'click', () => {
        console.log("Clic sur Passager détecté !"); ns.updateRoleButtons('passenger'); ns.toggleSectionsBasedOnRole('passenger');
    })) { console.log("Écouteur Passager attaché."); }

    if(attachListenerIfNeeded(driverBtn, 'click', () => {
        console.log("Clic sur Driver détecté !"); ns.updateRoleButtons('driver'); ns.toggleSectionsBasedOnRole('driver');
    })) { console.log("Écouteur Driver attaché."); }

    if(attachListenerIfNeeded(bothBtn, 'click', () => {
        console.log("Clic sur Both détecté !"); ns.updateRoleButtons('both'); ns.toggleSectionsBasedOnRole('both');
    })) { console.log("Écouteur Both attaché."); }


    // Attacher au formulaire chauffeur
    if(attachListenerIfNeeded(driverFormElement, 'submit', (event) => {
         event.preventDefault();
         console.log("Soumission formulaire chauffeur...");
         if (driverFormFeedback) { driverFormFeedback.textContent = ''; driverFormFeedback.className = 'mb-3'; }

         console.log("Validation formulaire chauffeur...");
         let isFormValid = true;
         // Appeler les validateurs du namespace
         isFormValid = ns.validateLicensePlate(licensePlateInput) && isFormValid;
         isFormValid = ns.validateRequiredInput(firstRegistrationInput) && isFormValid;
         isFormValid = ns.validateVehicleSelection(vehicleSelect) && isFormValid;
         isFormValid = ns.validateSeats(availableSeatsInput) && isFormValid;

         if (isFormValid) {
            console.log("Formulaire chauffeur VALIDE.");
            // ... (Logique MàJ currentUserData + message succès + setTimeout) ...
            const data = ns.currentUserData.driverInfo;
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
             console.log("Formulaire chauffeur INVALIDE.");
              if (driverFormFeedback) {
                 driverFormFeedback.textContent = 'Veuillez corriger les erreurs.';
                 driverFormFeedback.className = 'alert alert-danger mt-3';
             }
         }
    })) { console.log("Écouteur Submit Driver Form attaché."); }


     console.log("Fin attachement écouteurs page Account.");
};


// --- Initialisation de la Page ---
window.ecoRideAccountPage.initialize = function() {
    const ns = window.ecoRideAccountPage; // Alias

    if (ns.isInitialized) {
        console.log("Page Account déjà initialisée, mise à jour infos...");
        const userCreditsSpan = document.getElementById('user-credits');
        if (userCreditsSpan && window.getUserCredits) {
             userCreditsSpan.textContent = window.getUserCredits();
        }
        // Réappliquer affichage + historique
        ns.updateRoleButtons(ns.currentUserData.role);
        ns.toggleSectionsBasedOnRole(ns.currentUserData.role);
        ns.displayHistorique(); // Rafraîchir historique
        return;
    }
    console.log("Première initialisation de la page Account.");

    if (!window.isConnected()) { /* ... redirection ... */ return; }

    // Afficher infos initiales + historique
    ns.displayUserInfo(); // Ceci appelle déjà updateRoleButtons et toggleSections...
    ns.displayHistorique();

    // Attacher les écouteurs une seule fois
    ns.attachEventListeners();

    ns.isInitialized = true;
    console.log("Page Account marquée comme initialisée.");
};

// --- Exécution ---
window.ecoRideAccountPage.initialize();
