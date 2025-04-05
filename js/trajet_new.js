console.log("Exécution script trajet_new.js");

// --- Simulation des données du chauffeur (Véhicules) ---
// Idéalement, on récupère ça via une fonction globale ou API,
// mais pour la démo, on copie depuis account.js (ou on utilise localStorage si sauvegardé)
const currentUserVehicles = [ // Exemple basé sur currentUserData de account.js
    { id: 101, marque: "Tesla", modele: "Model 3", couleur: "Blanche", energie: "Électrique" },
    { id: 102, marque: "Peugeot", modele: "208", couleur: "Noire", energie: "Essence" }
];

// --- Sélection Éléments DOM ---
const trajetForm = document.getElementById('new-trajet-form');
const departInput = document.getElementById('trajet-depart');
const arriveeInput = document.getElementById('trajet-arrivee');
const dateDepartInput = document.getElementById('trajet-date-depart');
const heureDepartInput = document.getElementById('trajet-heure-depart');
const dateArriveeInput = document.getElementById('trajet-date-arrivee');
const heureArriveeInput = document.getElementById('trajet-heure-arrivee');
const placesInput = document.getElementById('trajet-places');
const prixInput = document.getElementById('trajet-prix');
const vehiculeSelect = document.getElementById('trajet-vehicule');
const errorDiv = document.getElementById('trajet-error');
const successDiv = document.getElementById('trajet-success');

// --- Fonctions ---

// Remplit la liste des véhicules
function populateVehicleSelectTrajet() {
    if (!vehiculeSelect) return;

    vehiculeSelect.innerHTML = '<option value="" selected disabled>Sélectionner votre véhicule...</option>';

    if (currentUserVehicles && currentUserVehicles.length > 0) {
        currentUserVehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id; // On stocke l'ID
            option.textContent = `${vehicle.marque} ${vehicle.modele} (${vehicle.energie})`;
            vehiculeSelect.appendChild(option);
        });
    } else {
        // Si le chauffeur n'a pas de véhicule enregistré (gérer ce cas !)
        vehiculeSelect.innerHTML = '<option value="" selected disabled>Aucun véhicule enregistré !</option>';
        vehiculeSelect.disabled = true; // Désactiver la sélection
         if(errorDiv){
            errorDiv.textContent = "Vous devez d'abord enregistrer un véhicule dans votre profil avant de proposer un trajet.";
            errorDiv.classList.remove('d-none');
        }
    }
}

// Validation simple des champs (peut être améliorée)
// On peut réutiliser/adapter les fonctions de validation de signup.js/account.js
function validateTrajetForm() {
    let isValid = true;
    errorDiv.textContent = '';
    errorDiv.classList.add('d-none');

    // Fonction simple pour vérifier si requis et ajouter/enlever classe
    const checkRequired = (input) => {
        input.classList.remove('is-invalid'); // Réinitialise
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            return false;
        }
        return true;
    };
     const checkNumeric = (input, min = 0, max = Infinity) => {
         input.classList.remove('is-invalid');
         const value = parseFloat(input.value);
          const minValue = parseFloat(input.min) || min;
          const maxValue = parseFloat(input.max) || max;
         if (isNaN(value) || value < minValue || value > maxValue) {
             input.classList.add('is-invalid');
             return false;
         }
         return true;
     };

    if (!checkRequired(departInput)) isValid = false;
    if (!checkRequired(arriveeInput)) isValid = false;
    if (!checkRequired(dateDepartInput)) isValid = false;
    if (!checkRequired(heureDepartInput)) isValid = false;
    if (!checkRequired(dateArriveeInput)) isValid = false;
    if (!checkRequired(heureArriveeInput)) isValid = false;
    if (!checkNumeric(placesInput, 1, 8)) isValid = false; // Utilise min/max du HTML
    if (!checkNumeric(prixInput, 0)) isValid = false; // Utilise min du HTML
    if (!checkRequired(vehiculeSelect) || vehiculeSelect.value === "") { // Vérifie aussi la sélection
         vehiculeSelect?.classList.add('is-invalid'); // ?. pour sécurité
         isValid = false;
    } else {
        vehiculeSelect?.classList.remove('is-invalid');
    }

    // TODO: Ajouter validation date/heure arrivée > date/heure départ

    if(!isValid && errorDiv){
        errorDiv.textContent = "Veuillez corriger les erreurs indiquées dans le formulaire.";
        errorDiv.classList.remove('d-none');
    }

    return isValid;
}


// --- Gestion Événements ---
if (trajetForm) {
    trajetForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("Soumission formulaire nouveau trajet...");

        if (validateTrajetForm()) {
            console.log("Formulaire valide. Simulation de l'enregistrement du trajet...");

            // Récupérer les données
            const trajetData = {
                depart: departInput.value.trim(),
                arrivee: arriveeInput.value.trim(),
                dateDepart: dateDepartInput.value,
                heureDepart: heureDepartInput.value,
                dateArrivee: dateArriveeInput.value,
                heureArrivee: heureArriveeInput.value,
                places: parseInt(placesInput.value, 10),
                prix: parseFloat(prixInput.value),
                vehiculeId: parseInt(vehiculeSelect.value, 10)
            };
            console.log("Données du trajet à envoyer (simulation) :", trajetData);

            // Ici, appel fetch vers l'API backend pour créer le covoiturage
            // fetch('/api/covoiturages', { method: 'POST', body: JSON.stringify(trajetData), ... })
            // Le backend devrait vérifier les crédits et déduire les 2 crédits.

            // Simulation Succès
            if(successDiv){
                successDiv.textContent = "Votre trajet a été proposé avec succès ! Il sera bientôt visible.";
                successDiv.classList.remove('d-none');
            } else {
                alert("Trajet proposé !");
            }

            trajetForm.reset(); // Vide le formulaire
            trajetForm.querySelectorAll('input, select, button').forEach(el => el.disabled = true); // Désactive

            // Redirection après délai
            setTimeout(() => {
                 // Redirige vers l'historique (suppose /account pour l'instant) ou la liste
                 window.location.href = '/account';
            }, 3000);

        } else {
            console.log("Formulaire nouveau trajet invalide.");
            // Les erreurs sont déjà affichées par validateTrajetForm
        }
    });
}

// --- Initialisation ---
function initializeNewTrajetPage() {
    console.log("Initialisation page nouveau trajet...");
     if(!window.isConnected() || !['driver', 'both'].includes(window.getRole())) {
         console.warn("Accès non autorisé (pas chauffeur/connecté), redirection...");
         window.location.replace("/"); // Sécurité supplémentaire
         return;
     }
    populateVehicleSelectTrajet(); // Remplit la liste des véhicules
     // Mettre la date de départ minimale à aujourd'hui
     if(dateDepartInput){
         const today = new Date().toISOString().split('T')[0];
         dateDepartInput.setAttribute('min', today);
         dateArriveeInput.setAttribute('min', today); // Arrivée ne peut pas être avant aujourd'hui non plus
     }
}

initializeNewTrajetPage();
