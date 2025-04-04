console.log("Exécution du script covoiturage_detail.js");

const allCovoitsFictifs = [
    // ... Copier/Coller les données complètes de allCovoitsFictifs depuis covoiturages.js ...
    { id: 1, depart: "Paris", arrivee: "Lyon", date: "2025-04-15", heureDepart: "08:00", heureArrivee: "12:30", prix: 25.50, placesRestantes: 3, ecologique: true, vehicule: { marque: "Tesla", modele: "Model 3", energie: "Électrique", couleur: "Blanche" }, chauffeur: { pseudo: "ChauffeurCool75", photo: "/images/Andrea.jpg", note: 4.8, avisCount: 15, preferences: ["Non fumeur", "Musique calme", "Pas d'animaux"], avisRecus: [ { auteur: "Passager1", note: 5, commentaire: "Trajet parfait, conduite très agréable !" }, { auteur: "Passager2", note: 4, commentaire: "Bon conducteur, voiture propre." } ] } },
    { id: 2, depart: "Paris", arrivee: "Lyon", date: "2025-04-15", heureDepart: "09:30", heureArrivee: "14:00", prix: 28.00, placesRestantes: 1, ecologique: false, vehicule: { marque: "Peugeot", modele: "308", energie: "Essence", couleur: "Grise" }, chauffeur: { pseudo: "VoyageurPro", photo: "images/default-profile.png", note: 4.5, avisCount: 8, preferences: ["Accepte les fumeurs (fenêtre ouverte)", "Discussion bienvenue"], avisRecus: [ { auteur: "Passager3", note: 4, commentaire: "Bien, mais un peu de retard." }, ] } },
    { id: 3, depart: "Marseille", arrivee: "Nice", date: "2025-04-16", heureDepart: "10:00", heureArrivee: "12:15", prix: 15.00, placesRestantes: 2, ecologique: true, vehicule: { marque: "Renault", modele: "Zoe", energie: "Électrique", couleur: "Bleue" }, chauffeur: { pseudo: "Soleil13", photo: "images/default-profile.png", note: 4.9, avisCount: 22, preferences: ["Non fumeur", "Petits animaux acceptés (en cage)", "Musique variée"], avisRecus: [ { auteur: "Passager4", note: 5, commentaire: "Super sympa et arrangeant !" }, { auteur: "Passager5", note: 5, commentaire: "Conduite impeccable, je recommande." }, { auteur: "Passager6", note: 5, commentaire: "Ponctuel et agréable." }, ] } },
    { id: 4, depart: "Paris", arrivee: "Lille", date: "2025-04-15", heureDepart: "14:00", heureArrivee: "16:30", prix: 18.00, placesRestantes: 4, ecologique: false, vehicule: { marque: "Citroën", modele: "C4", energie: "Diesel", couleur: "Noire" }, chauffeur: { pseudo: "NordisteRapide", photo: "images/default-profile.png", note: 4.2, avisCount: 5, preferences: ["Fumeur OK", "Pas d'animaux"], avisRecus: [{ auteur: "Passager7", note: 4, commentaire: "Correct."}] } },
    { id: 5, depart: "Lyon", arrivee: "Paris", date: "2025-04-17", heureDepart: "07:00", heureArrivee: "11:30", prix: 26.00, placesRestantes: 2, ecologique: true, vehicule: { marque: "Hyundai", modele: "Kona Electric", energie: "Électrique", couleur: "Verte" }, chauffeur: { pseudo: "RetourParis", photo: "images/default-profile.png", note: 4.7, avisCount: 11, preferences: ["Non fumeur", "Pas d'animaux"], avisRecus: [ { auteur: "Passager8", note: 5, commentaire: "Très bon trajet retour."}] } },
];

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

    // Trouver le covoiturage correspondant dans nos données fictives
    const covoit = findCovoitById(covoitId);

    if (!covoit) {
        console.error(`Covoiturage avec ID ${covoitId} non trouvé.`);
        titleH1.textContent = "Covoiturage Introuvable";
        errorDiv.textContent = `Désolé, le covoiturage demandé (ID: ${covoitId}) n'a pas été trouvé.`;
        errorDiv.style.display = 'block';
        contentDiv.innerHTML = ''; // Enlève le spinner
        return;
    }

    console.log("Covoiturage trouvé :", covoit);

    // Mettre à jour le titre
    titleH1.textContent = `Covoiturage ${covoit.depart} - ${covoit.arrivee}`;

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
                    <p><i class="bi bi-calendar-event me-1"></i> <strong>Date :</strong> ${formatDate(covoit.date)}</p>
                    <p><i class="bi bi-clock-fill me-1"></i> <strong>Départ :</strong> ${covoit.depart} à ${covoit.heureDepart}</p>
                    <p><i class="bi bi-flag-fill me-1"></i> <strong>Arrivée :</strong> ${covoit.arrivee} à ${covoit.heureArrivee}</p>
                    <p><i class="bi bi-people-fill me-1"></i> <strong>Places restantes :</strong> ${covoit.placesRestantes}</p>
                    <p><i class="bi bi-currency-euro me-1"></i> <strong>Prix par passager :</strong> ${covoit.prix.toFixed(2)} €</p>
                    ${covoit.ecologique ? '<p><span class="badge bg-success"><i class="bi bi-leaf me-1"></i>Voyage Écologique</span></p>' : ''}
                </div>
            </div>

            <div class="card mt-4">
                 <div class="card-header">
                    Informations Chauffeur & Véhicule
                </div>
                 <div class="card-body row">
                     <div class="col-md-4 text-center">
                         <img src="${covoit.chauffeur.photo || 'images/default-profile.png'}" alt="${covoit.chauffeur.pseudo}" class="img-fluid rounded-circle mb-2" style="max-width: 100px;">
                         <h5>${covoit.chauffeur.pseudo}</h5>
                         <p>⭐ ${covoit.chauffeur.note ? covoit.chauffeur.note.toFixed(1) : 'N/A'} / 5 (${covoit.chauffeur.avisCount || 0} avis)</p>
                     </div>
                     <div class="col-md-8">
                        <h6>Véhicule :</h6>
                        <p><i class="bi bi-car-front-fill me-1"></i> ${covoit.vehicule.marque} ${covoit.vehicule.modele} (${covoit.vehicule.couleur})</p>
                        <p><i class="bi bi-fuel-pump-fill me-1"></i> Énergie : ${covoit.vehicule.energie}</p>

                        <h6 class="mt-3">Préférences du conducteur :</h6>
                        ${covoit.chauffeur.preferences && covoit.chauffeur.preferences.length > 0
                            ? `<ul>${covoit.chauffeur.preferences.map(pref => `<li>${pref}</li>`).join('')}</ul>`
                            : '<p>Pas de préférences spécifiques indiquées.</p>'
                        }
                     </div>
                 </div>
            </div>
            {# --- Bouton Participer (US 6 - Logique à ajouter ici si besoin) --- #}
            <div class="action-participer text-center mt-4">
                {# TODO: Ajouter la logique du bouton participer comme vu précédemment,
                   en vérifiant app.user (via isConnected/getRole) et les crédits si nécessaire.
                   Pour l'instant, juste un placeholder. #}
                 <button class="btn btn-success btn-lg" disabled>Participer (Logique US6 à venir)</button>
            </div>
        </div>
    `;

    // Section Avis
    let avisHtml = `
        <div class="col-lg-4">
            <div class="card">
                <div class="card-header">
                    Avis sur ${covoit.chauffeur.pseudo}
                </div>
                <div class="list-group list-group-flush">
                    ${covoit.chauffeur.avisRecus && covoit.chauffeur.avisRecus.length > 0
                        ? covoit.chauffeur.avisRecus.map(avis => `
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

    // Nettoyer les paramètres de route de window après les avoir lus
    // delete window.routeParams; // Optionnel mais propre
}


// --- Exécution ---
// Appeler la fonction d'affichage une fois que le script est chargé
displayCovoitDetails();
