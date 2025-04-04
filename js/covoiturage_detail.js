console.log("Exécution du script covoiturage_detail.js");

const allCovoitsFictifs = [
    { id: 1, depart: "Paris", arrivee: "Lyon", date: "2025-04-15", heureDepart: "08:00", heureArrivee: "12:30", prix: 25.50, placesRestantes: 3, ecologique: true, vehicule: { marque: "Tesla", modele: "Model 3", energie: "Électrique", couleur: "Blanche" }, chauffeur: { pseudo: "ChauffeurCool75", photo: "/images/Andrea.jpg", note: 4.8, avisCount: 15, preferences: ["Non fumeur", "Musique calme", "Pas d'animaux"], avisRecus: [ { auteur: "Passager1", note: 5, commentaire: "Trajet parfait, conduite très agréable !" }, { auteur: "Passager2", note: 4, commentaire: "Bon conducteur, voiture propre." } ] } },
    { id: 2, depart: "Paris", arrivee: "Lyon", date: "2025-04-15", heureDepart: "09:30", heureArrivee: "14:00", prix: 28.00, placesRestantes: 1, ecologique: false, vehicule: { marque: "Peugeot", modele: "308", energie: "Essence", couleur: "Grise" }, chauffeur: { pseudo: "VoyageurPro", photo: "images/default-profile.png", note: 4.5, avisCount: 8, preferences: ["Accepte les fumeurs (fenêtre ouverte)", "Discussion bienvenue"], avisRecus: [ { auteur: "Passager3", note: 4, commentaire: "Bien, mais un peu de retard." }, ] } },
    { id: 3, depart: "Marseille", arrivee: "Nice", date: "2025-04-16", heureDepart: "10:00", heureArrivee: "12:15", prix: 15.00, placesRestantes: 2, ecologique: true, vehicule: { marque: "Renault", modele: "Zoe", energie: "Électrique", couleur: "Bleue" }, chauffeur: { pseudo: "Soleil13", photo: "images/default-profile.png", note: 4.9, avisCount: 22, preferences: ["Non fumeur", "Petits animaux acceptés (en cage)", "Musique variée"], avisRecus: [ { auteur: "Passager4", note: 5, commentaire: "Super sympa et arrangeant !" }, { auteur: "Passager5", note: 5, commentaire: "Conduite impeccable, je recommande." }, { auteur: "Passager6", note: 5, commentaire: "Ponctuel et agréable." }, ] } },
    { id: 4, depart: "Paris", arrivee: "Lille", date: "2025-04-15", heureDepart: "14:00", heureArrivee: "16:30", prix: 18.00, placesRestantes: 4, ecologique: false, vehicule: { marque: "Citroën", modele: "C4", energie: "Diesel", couleur: "Noire" }, chauffeur: { pseudo: "NordisteRapide", photo: "images/default-profile.png", note: 4.2, avisCount: 5, preferences: ["Fumeur OK", "Pas d'animaux"], avisRecus: [{ auteur: "Passager7", note: 4, commentaire: "Correct."}] } },
    { id: 5, depart: "Lyon", arrivee: "Paris", date: "2025-04-17", heureDepart: "07:00", heureArrivee: "11:30", prix: 26.00, placesRestantes: 2, ecologique: true, vehicule: { marque: "Hyundai", modele: "Kona Electric", energie: "Électrique", couleur: "Verte" }, chauffeur: { pseudo: "RetourParis", photo: "images/default-profile.png", note: 4.7, avisCount: 11, preferences: ["Non fumeur", "Pas d'animaux"], avisRecus: [ { auteur: "Passager8", note: 5, commentaire: "Très bon trajet retour."}] } },
];

let currentCovoit = null;

// Fonction pour trouver un covoiturage par son ID dans les données fictives
function findCovoitById(id) {
    // Convertir l'ID (qui vient de l'URL en string) en nombre entier
    const numericId = parseInt(id, 10);
    return allCovoitsFictifs.find(covoit => covoit.id === numericId);
}

// Fonction pour formater une date (réutilisée)
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function handleParticipation() {
    console.log("Tentative de participation...");

    if (!currentCovoit) {
        console.error("Aucun covoiturage courant défini pour la participation.");
        alert("Une erreur s'est produite. Impossible de participer.");
        return;
    }
     // Vérification côté client (rappel : doit être re-vérifié côté serveur !)
     const userConnected = window.isConnected();
     const userCredits = window.getUserCredits ? window.getUserCredits() : 0; // Utilise la fonction globale
     const requiredCredits = Math.ceil(currentCovoit.prix); // Simule 1 euro = 1 crédit entier
 
     console.log(`Vérification: Connecté=${userConnected}, Crédits=${userCredits}, Requis=${requiredCredits}, Places=${currentCovoit.placesRestantes}`);
 
     if (!userConnected) {
         alert("Vous devez être connecté pour participer.");
         // Optionnel: rediriger vers la page de connexion
         // window.location.href = '/signin';
         return;
     }
 
     if (currentCovoit.placesRestantes <= 0) {
         alert("Désolé, ce covoiturage est complet.");
         // Mettre à jour l'affichage pour être sûr
         updateParticipationButtonState();
         return;
     }
 
     if (userCredits < requiredCredits) {
         alert(`Crédits insuffisants. Vous avez ${userCredits}, il vous faut ${requiredCredits} crédits pour ce trajet.`);
         return;
     }
 
     // --- Double Confirmation ---
     const confirmationMessage = `Confirmez-vous vouloir utiliser ${requiredCredits} crédits pour participer à ce covoiturage (${currentCovoit.depart} -> ${currentCovoit.arrivee}) ?`;
     if (window.confirm(confirmationMessage)) {
         console.log("Participation confirmée par l'utilisateur.");
 
         // --- Simulation de l'Enregistrement ---
         // 1. Déduire les crédits (utilise la fonction globale)
         const deductionOk = window.deductUserCredits ? window.deductUserCredits(requiredCredits) : false;
 
         if (deductionOk) {
             console.log("Simulation: Crédits déduits.");
 
             // 2. Mettre à jour les données fictives (localement pour la démo)
             // Décrémenter les places
             currentCovoit.placesRestantes--;
             console.log(`Simulation: Places restantes mises à jour: ${currentCovoit.placesRestantes}`);
             // TODO: Ajouter l'utilisateur à une liste de passagers fictive si nécessaire pour d'autres US
 
             // 3. Afficher un message de succès
             const feedbackDiv = document.getElementById('participation-feedback');
             if(feedbackDiv) {
                 feedbackDiv.textContent = "Votre participation a bien été enregistrée ! Bon voyage !";
                 feedbackDiv.className = 'alert alert-success mt-3'; 
             } else {
                  alert("Participation enregistrée !"); // Fallback
             }
 
             // 4. Mettre à jour l'affichage de la page
             updateParticipationButtonState(); // Masque/désactive le bouton, met à jour les places
             updatePlacesRestantesDisplay(); // Met à jour spécifiquement l'affichage des places
 
 
         } else {
             console.error("Échec de la déduction des crédits (simulation).");
             alert("Une erreur est survenue lors de la déduction de vos crédits. Veuillez réessayer.");
         }
 
     } else {
         console.log("Participation annulée par l'utilisateur.");
     }
 }
// Fonction pour mettre à jour l'état du bouton/message Participer 
function updateParticipationButtonState() {
    const participationContainer = document.getElementById('participation-container');
    if (!participationContainer) return;

    const userConnected = window.isConnected();

    // Si pas de covoiturage chargé ou plus de place
    if (!currentCovoit || currentCovoit.placesRestantes <= 0) {
        participationContainer.innerHTML = `<p class="text-muted">Ce covoiturage est complet.</p>`;
        return;
    }

    // Si visiteur
    if (!userConnected) {
        participationContainer.innerHTML = `
            <p class="alert alert-info">
                Vous devez être <a href="/signin?redirect_to=${encodeURIComponent(window.location.pathname + window.location.search)}" data-link>connecté</a>
                ou <a href="/signup" data-link>créer un compte</a> pour participer.
            </p>`;
        return;
    }

    // Si connecté mais pas assez de crédits
    const userCredits = window.getUserCredits ? window.getUserCredits() : 0;
    const requiredCredits = Math.ceil(currentCovoit.prix);
    if (userCredits < requiredCredits) {
         participationContainer.innerHTML = `
            <p class="alert alert-warning">
                Crédits insuffisants (${userCredits} / ${requiredCredits} requis).
                <button class="btn btn-success btn-sm ms-2" disabled>Participer</button>
            </p>`;
         // TODO: Ajouter un lien pour recharger les crédits ?
        return;
    }

    // Si connecté, assez de crédits et des places -> Afficher le bouton
    participationContainer.innerHTML = `
        <button id="participate-btn" class="btn btn-success btn-lg">
            Participer (${requiredCredits} crédits)
        </button>
        <div id="participation-feedback" class="mt-3"></div> {# Zone pour message succès/erreur #}
    `;

    // Ajouter l'écouteur SEULEMENT si le bouton est affiché
    const participateBtn = document.getElementById('participate-btn');
    if (participateBtn) {
        // Enlever un ancien écouteur au cas où (sécurité)
        participateBtn.removeEventListener('click', handleParticipation);
        // Ajouter le nouvel écouteur
        participateBtn.addEventListener('click', handleParticipation);
        console.log("Écouteur ajouté au bouton Participer.");
    }
}
// Fonction pour mettre à jour spécifiquement l'affichage des places 
function updatePlacesRestantesDisplay() {
    const placesElement = document.getElementById('places-restantes-display');
    if (placesElement && currentCovoit) {
        placesElement.textContent = currentCovoit.placesRestantes;
    }
     // Mettre à jour aussi dans la section principale si l'ID existe
     const placesMainElement = document.querySelector('.places-main-display');
     if(placesMainElement && currentCovoit){
         placesMainElement.textContent = currentCovoit.placesRestantes;
     }
}


// Fonction principale pour afficher les détails
function displayCovoitDetails() {
    console.log("Affichage des détails...");

    const contentDiv = document.getElementById('detail-content');
    const titleH1 = document.getElementById('detail-title');
    const errorDiv = document.getElementById('detail-error');

    // Récupérer les paramètres passés par le routeur
    const params = window.routeParams || {};
    const covoitId = params.id; // Récupère la valeur du paramètre :id

    console.log("ID du covoiturage demandé :", covoitId);

    if (!contentDiv || !titleH1 || !errorDiv) {
        console.error("Éléments HTML de base manquants pour l'affichage des détails.");
        return;
    }

    // Cacher l'erreur et vider le contenu précédent (sauf le spinner)
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    // Garder le spinner visible tant qu'on n'a pas les données
    // contentDiv.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Chargement...</span></div></div>';


    if (!covoitId) {
        console.error("Aucun ID de covoiturage trouvé dans les paramètres de route.");
        titleH1.textContent = "Erreur";
        errorDiv.textContent = "Impossible d'identifier le covoiturage à afficher.";
        errorDiv.style.display = 'block';
        contentDiv.innerHTML = ''; // Enlève le spinner
        return;
    }

    currentCovoit = findCovoitById(covoitId); 

    if (!currentCovoit) { 
        console.error(`Covoiturage ID ${covoitId} non trouvé.`);
        titleH1.textContent = "Covoiturage Introuvable";
        errorDiv.textContent = `Désolé, covoiturage ID: ${covoitId} non trouvé.`;
        errorDiv.style.display = 'block';
        contentDiv.innerHTML = '';
        return;
    }

    console.log("Covoiturage trouvé :", currentCovoit);
    titleH1.textContent = `Covoiturage ${currentCovoit.depart} - ${currentCovoit.arrivee}`;

    // Construire le HTML détaillé
    // Utilisation de Bootstrap grid (row > col-md-X) pour la mise en page
    // Section principale (Trajet, Chauffeur, Véhicule)
    let mainInfoHtml = `
        <div class="col-lg-8">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    Détails du Trajet
                </div>
                <div class="card-body">
                    <p><i class="bi bi-calendar-event me-1"></i> <strong>Date :</strong> ${formatDate(currentCovoit.date)}</p>
                    <p><i class="bi bi-clock-fill me-1"></i> <strong>Départ :</strong> ${currentCovoit.depart} à ${currentCovoit.heureDepart}</p>
                    <p><i class="bi bi-flag-fill me-1"></i> <strong>Arrivée :</strong> ${currentCovoit.arrivee} à ${currentCovoit.heureArrivee}</p>
                    <p><i class="bi bi-people-fill me-1"></i> <strong>Places restantes :</strong> ${currentCovoit.placesRestantes}</p>
                    <p><i class="bi bi-currency-euro me-1"></i> <strong>Prix par passager :</strong> ${currentCovoit.prix.toFixed(2)} €</p>
                    ${currentCovoit.ecologique ? '<p><span class="badge bg-success"><i class="bi bi-leaf me-1"></i>Voyage Écologique</span></p>' : ''}
                </div>
            </div>

            <div class="card mt-4">
                 <div class="card-header">
                    Informations Chauffeur & Véhicule
                </div>
                 <div class="card-body row">
                     <div class="col-md-4 text-center">
                         <img src="${currentCovoit.chauffeur.photo || 'images/default-profile.png'}" alt="${currentCovoit.chauffeur.pseudo}" class="img-fluid rounded-circle mb-2" style="max-width: 100px;">
                         <h5>${currentCovoit.chauffeur.pseudo}</h5>
                         <p>⭐ ${currentCovoit.chauffeur.note ? currentCovoit.chauffeur.note.toFixed(1) : 'N/A'} / 5 (${currentCovoit.chauffeur.avisCount || 0} avis)</p>
                     </div>
                     <div class="col-md-8">
                        <h6>Véhicule :</h6>
                        <p><i class="bi bi-car-front-fill me-1"></i> ${currentCovoit.vehicule.marque} ${currentCovoit.vehicule.modele} (${currentCovoit.vehicule.couleur})</p>
                        <p><i class="bi bi-fuel-pump-fill me-1"></i> Énergie : ${currentCovoit.vehicule.energie}</p>

                        <h6 class="mt-3">Préférences du conducteur :</h6>
                        ${currentCovoit.chauffeur.preferences && currentCovoit.chauffeur.preferences.length > 0
                            ? `<ul>${currentCovoit.chauffeur.preferences.map(pref => `<li>${pref}</li>`).join('')}</ul>`
                            : '<p>Pas de préférences spécifiques indiquées.</p>'
                        }
                     </div>
                 </div>
            </div>

            <div id="participation-container" class="text-center my-4">
                 {# Le contenu (bouton/message) sera injecté ici par updateParticipationButtonState #}
            </div>
        </div>
    `;

    // Section Avis
    let avisHtml = `
        <div class="col-lg-4">
            <div class="card">
                <div class="card-header">
                    Avis sur ${currentCovoit.chauffeur.pseudo}
                </div>
                <div class="list-group list-group-flush">
                    ${currentCovoit.chauffeur.avisRecus && currentCovoit.chauffeur.avisRecus.length > 0
                        ? currentCovoit.chauffeur.avisRecus.map(avis => `
                            <div class="list-group-item">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1">${avis.auteur}</h6>
                                    <small>⭐ ${avis.note}/5</small>
                                </div>
                                <p class="mb-1 small">${avis.commentaire}</p>
                            </div>
                        `).join('')
                        : '<div class="list-group-item"><p class="text-muted text-center my-3">Aucun avis pour ce chauffeur.</p></div>'
                    }
                </div>
            </div>
        </div>
    `;

    // Injecter le HTML dans le conteneur principal
    contentDiv.innerHTML = mainInfoHtml + avisHtml;

    console.log("Détails affichés.");

     // --- Mettre à jour l'état initial du bouton Participer ---
     updateParticipationButtonState();
    // delete window.routeParams; // Optionnel mais propre
}


// --- Exécution ---
// Appeler la fonction d'affichage une fois que le script est chargé
displayCovoitDetails();
