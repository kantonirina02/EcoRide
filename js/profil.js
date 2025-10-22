console.log("Exécution du script profil.js");

const API_BASE_URL = "/api";
const API_PROFILE_ENDPOINT = `${API_BASE_URL}/security/profile`;
const API_HISTORY_ENDPOINT = `${API_BASE_URL}/covoiturages/history`;
const API_STATS_ENDPOINT = `${API_BASE_URL}/statistics/general`;
const API_RECENT_ACTIVITY_ENDPOINT = `${API_BASE_URL}/statistics/recent-activity`;
const API_PROFILE_UPDATE_ENDPOINT = `${API_BASE_URL}/security/profile`;
const API_PASSWORD_ENDPOINT = `${API_BASE_URL}/security/password`;
const API_PREFERENCES_ENDPOINT = `${API_BASE_URL}/security/preferences`;

class ProfileManager {
    constructor() {
        this.profileForm = document.getElementById("profileForm");
        this.passwordForm = document.getElementById("passwordForm");
        this.securityForm = document.getElementById("securityForm");
        this.historyContainer = document.getElementById("historyContainer");
        this.noHistoryMessage = document.getElementById("noHistoryMessage");
        this.recentActivity = document.getElementById("recentActivity");

        this.userData = null;
        this.tripsHistory = [];
        this.stats = null;
        this.activities = [];

        this.init();
    }

    async init() {
        await this.loadUserData();

        this.profileForm?.addEventListener("submit", async (event) => {
            event.preventDefault();
            await this.saveProfile();
        });

        this.passwordForm?.addEventListener("submit", async (event) => {
            event.preventDefault();
            await this.changePassword();
        });

        this.securityForm?.addEventListener("submit", async (event) => {
            event.preventDefault();
            await this.saveSecurityPreferences();
        });

        document.getElementById("historyFilter")?.addEventListener("change", () => this.displayHistory());
        document.getElementById("historyDateFilter")?.addEventListener("change", () => this.displayHistory());

        this.setupValidation();
    }

    async fetchJson(url, options = {}) {
        const token = window.getToken ? window.getToken() : null;
        const headers = {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {}),
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include",
        });

        if (response.status === 401) {
            throw new Error("Vous devez être connecté pour accéder à votre profil.");
        }
        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.message || payload.error || `Erreur ${response.status}`);
        }

        if (response.status === 204) return null;
        return response.json();
    }

    async loadUserData() {
        try {
            this.userData = await this.fetchJson(API_PROFILE_ENDPOINT);
            this.displayUserData();
        } catch (error) {
            console.error("Profil indisponible :", error);
            this.showAlert(error.message, "danger");
            return;
        }

        try {
            const history = await this.fetchJson(API_HISTORY_ENDPOINT);
            this.tripsHistory = Array.isArray(history) ? history : [];
        } catch (error) {
            console.warn("Historique indisponible :", error);
            this.tripsHistory = [];
        }
        this.displayHistory();

        try {
            this.stats = await this.fetchJson(API_STATS_ENDPOINT);
        } catch (error) {
            console.warn("Statistiques indisponibles :", error);
            this.stats = null;
        }
        this.displayStats();

        try {
            const recent = await this.fetchJson(API_RECENT_ACTIVITY_ENDPOINT);
            this.activities = Array.isArray(recent?.activite_recente) ? recent.activite_recente : (Array.isArray(recent) ? recent : []);
        } catch (error) {
            console.warn("Activité récente indisponible :", error);
            this.activities = [];
        }
        this.displayRecentActivity();
    }

    displayUserData() {
        if (!this.userData) return;

        const safeValue = (value) => value ?? "";

        document.getElementById("nom").value = safeValue(this.userData.nom);
        document.getElementById("prenom").value = safeValue(this.userData.prenom);
        document.getElementById("email").value = safeValue(this.userData.email);
        document.getElementById("telephone").value = safeValue(this.userData.telephone);
        document.getElementById("dateNaissance").value = safeValue(this.userData.dateNaissance);
        document.getElementById("pseudo").value = safeValue(this.userData.pseudo);
        document.getElementById("adresse").value = safeValue(this.userData.adresse);
        document.getElementById("biographie").value = safeValue(this.userData.biographie);

        const creationDate = this.userData.memberSince || this.userData.dateCreation;
        document.getElementById("memberSince").textContent = creationDate ? new Date(creationDate).toLocaleDateString("fr-FR") : "NC";
        document.getElementById("lastLogin").textContent = this.userData.lastLogin ? new Date(this.userData.lastLogin).toLocaleString("fr-FR") : "NC";

        const prefs = this.userData.preferences || {};
        document.getElementById("emailNotifications").checked = !!prefs.emailNotifications;
        document.getElementById("smsNotifications").checked = !!prefs.smsNotifications;
        document.getElementById("profileVisibility").checked = prefs.profileVisibility !== false;
    }

    displayHistory() {
        const filter = document.getElementById("historyFilter")?.value || "all";
        const dateFilter = document.getElementById("historyDateFilter")?.value;

        let filteredTrips = Array.isArray(this.tripsHistory) ? [...this.tripsHistory] : [];

        if (filter !== "all") {
            filteredTrips = filteredTrips.filter((trip) => (trip.type || trip.role) === filter);
        }

        if (dateFilter) {
            filteredTrips = filteredTrips.filter((trip) => {
                const tripDate = trip.date || trip.dateDepart?.slice(0, 10);
                return tripDate >= dateFilter;
            });
        }

        if (filteredTrips.length === 0) {
            this.showNoHistoryMessage();
            return;
        }

        this.hideNoHistoryMessage();

        this.historyContainer.innerHTML = filteredTrips
            .map((trip) => {
                const type = trip.type || trip.role || "passenger";
                const departure = trip.departure || trip.lieuDepart || "Ville inconnue";
                const arrival = trip.arrival || trip.lieuArrivee || "Ville inconnue";
                const date = trip.date || trip.dateDepart?.slice(0, 10);
                const time = trip.time || trip.dateDepart?.slice(11, 16) || "--:--";
                const price = trip.price ?? trip.prix ?? trip.prixPersonne ?? 0;
                const rating = trip.rating ?? trip.note ?? 0;
                const driver = trip.driver || trip.conducteur?.pseudo || trip.conducteur?.nom || "Conducteur";
                const status = trip.status || trip.statut || "completed";

                return `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center">
                                        <div class="trip-icon me-3">
                                            <i class="bi bi-${type === "driver" ? "car-front" : "person"} display-6 text-${type === "driver" ? "success" : "info"}"></i>
                                        </div>
                                        <div>
                                            <h6 class="mb-1">${departure} → ${arrival}</h6>
                                            <p class="text-muted mb-0">
                                                <i class="bi bi-calendar-event me-1"></i>${this.formatDate(date)}
                                                <i class="bi bi-clock ms-2 me-1"></i>${time}
                                            </p>
                                            <small class="text-muted">
                                                ${type === "driver" ? "Conducteur" : `Passager chez ${driver}`}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 text-center">
                                    <div class="mb-2">
                                        <span class="h5 text-success mb-0">${Number(price).toFixed(2)}€</span>
                                    </div>
                                    <small class="text-muted">Prix payé</small>
                                </div>
                                <div class="col-md-3 text-end">
                                    <div class="rating mb-2">
                                        ${"★".repeat(Math.round(rating))}${"☆".repeat(5 - Math.round(rating))}
                                        <span class="text-muted ms-1">(${rating || "N/A"})</span>
                                    </div>
                                    <span class="badge bg-success">${status === "completed" ? "Terminé" : "En cours"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join("");

        this.attachHistoryActions();
    }

    displayStats() {
        if (this.stats) {
            document.getElementById("totalTrips").textContent = this.stats.general?.total_covoiturages ?? this.stats.totalCovoiturages ?? this.tripsHistory.length;
            document.getElementById("totalEarned").textContent = `${this.stats.financier?.credits_totaux ?? this.stats.totalCredits ?? 0}€`;
            document.getElementById("avgRating").textContent = (this.stats.avis?.note_moyenne ?? this.stats.averageRating ?? 0).toFixed(1);
            document.getElementById("ecoImpact").textContent = this.stats.general?.covoiturages_disponibles ?? this.stats.ecoImpact ?? 0;
            return;
        }

        const totalTrips = this.tripsHistory.length;
        const totalEarned = this.tripsHistory.filter((trip) => (trip.type || trip.role) === "driver").reduce((sum, trip) => sum + (trip.price || 0), 0);
        const avgRating = totalTrips > 0 ? this.tripsHistory.reduce((sum, trip) => sum + (trip.rating || 0), 0) / totalTrips : 0;
        const ecoImpact = Math.round(totalTrips * 15.5);

        document.getElementById("totalTrips").textContent = totalTrips;
        document.getElementById("totalEarned").textContent = `${totalEarned.toFixed(2)}€`;
        document.getElementById("avgRating").textContent = avgRating.toFixed(1);
        document.getElementById("ecoImpact").textContent = ecoImpact;
    }

    displayRecentActivity() {
        if (!this.recentActivity) return;
        if (!this.activities.length) {
            this.recentActivity.innerHTML = '<p class="text-muted">Aucune activité récente.</p>';
            return;
        }

        this.recentActivity.innerHTML = this.activities
            .map((activity) => `
                <div class="d-flex align-items-start mb-3">
                    <div class="activity-icon me-3">
                        <i class="bi ${activity.icon || "bi-bell"} ${activity.iconClass || ""}"></i>
                    </div>
                    <div>
                        <p class="mb-1">${activity.message || activity.libelle || "Nouvelle activité"}</p>
                        <small class="text-muted">
                            <i class="bi bi-clock me-1"></i>${this.formatDate(activity.date || activity.date_evenement || "")}
                        </small>
                    </div>
                </div>
            `)
            .join("");
    }

    async saveProfile() {
        const formData = {
            nom: this.profileForm.nom.value,
            prenom: this.profileForm.prenom.value,
            telephone: this.profileForm.telephone.value,
            dateNaissance: this.profileForm.dateNaissance.value,
            pseudo: this.profileForm.pseudo.value,
            adresse: this.profileForm.adresse.value,
            biographie: this.profileForm.biographie.value,
        };

        try {
            await this.fetchJson(API_PROFILE_UPDATE_ENDPOINT, {
                method: "PUT",
                body: JSON.stringify(formData),
            });
            this.showAlert("Profil mis à jour avec succès.", "success");
            await this.loadUserData();
        } catch (error) {
            console.error(error);
            this.showAlert(error.message || "Impossible de mettre à jour le profil.", "danger");
        }
    }

    async changePassword() {
        const currentPassword = this.passwordForm.currentPassword.value;
        const newPassword = this.passwordForm.newPassword.value;
        const confirmPassword = this.passwordForm.confirmPassword.value;

        if (newPassword !== confirmPassword) {
            this.showAlert("Les mots de passe ne correspondent pas.", "warning");
            return;
        }

        try {
            await this.fetchJson(API_PASSWORD_ENDPOINT, {
                method: "POST",
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            this.showAlert("Mot de passe mis à jour.", "success");
            this.passwordForm.reset();
        } catch (error) {
            console.error(error);
            this.showAlert(error.message || "Impossible de mettre à jour le mot de passe.", "danger");
        }
    }

    async saveSecurityPreferences() {
        const preferences = {
            emailNotifications: this.securityForm.emailNotifications.checked,
            smsNotifications: this.securityForm.smsNotifications.checked,
            profileVisibility: this.securityForm.profileVisibility.checked,
        };

        try {
            await this.fetchJson(API_PREFERENCES_ENDPOINT, {
                method: "PATCH",
                body: JSON.stringify(preferences),
            });
            this.showAlert("Préférences mises à jour.", "success");
        } catch (error) {
            console.error(error);
            this.showAlert(error.message || "Impossible de mettre à jour les préférences.", "danger");
        }
    }

    attachHistoryActions() {
        this.historyContainer?.querySelectorAll("[data-action]").forEach((button) => {
            const action = button.dataset.action;
            const tripId = button.dataset.tripId;

            if (action === "cancel") {
                button.addEventListener("click", () => this.cancelTrip(tripId));
            } else if (action === "view") {
                button.addEventListener("click", () => this.viewTrip(tripId));
            }
        });
    }

    cancelTrip(tripId) {
        console.log(`Annulation du trajet ${tripId} (implémentation backend nécessaire).`);
        this.showAlert("La fonctionnalité d’annulation sera disponible prochainement.", "info");
    }

    viewTrip(tripId) {
        window.location.href = `/covoiturages/${tripId}`;
    }

    setupValidation() {
        const emailInput = document.getElementById("email");
        emailInput?.addEventListener("blur", (event) => {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.target.value);
            event.target.classList.toggle("is-invalid", !isValid);
        });

        const passwordInput = document.getElementById("newPassword");
        const confirmInput = document.getElementById("confirmPassword");

        passwordInput?.addEventListener("input", () => {
            const isValid = passwordInput.value.length >= 8;
            passwordInput.classList.toggle("is-invalid", !isValid);
        });

        confirmInput?.addEventListener("input", () => {
            const matches = confirmInput.value === passwordInput.value;
            confirmInput.classList.toggle("is-invalid", !matches);
        });
    }

    showAlert(message, type = "info") {
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 320px;";
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 6000);
    }

    showNoHistoryMessage() {
        this.historyContainer.innerHTML = "";
        if (this.noHistoryMessage) this.noHistoryMessage.classList.remove("d-none");
    }

    hideNoHistoryMessage() {
        if (this.noHistoryMessage) this.noHistoryMessage.classList.add("d-none");
    }

    formatDate(dateString) {
        if (!dateString) return "Date inconnue";
        return new Date(dateString).toLocaleDateString("fr-FR");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.profileManager = new ProfileManager();
});

