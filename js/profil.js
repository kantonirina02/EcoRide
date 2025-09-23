// Gestion du profil utilisateur
class ProfileManager {
    constructor() {
        this.profileForm = document.getElementById('profileForm');
        this.passwordForm = document.getElementById('passwordForm');
        this.securityForm = document.getElementById('securityForm');
        this.historyContainer = document.getElementById('historyContainer');
        this.noHistoryMessage = document.getElementById('noHistoryMessage');
        this.recentActivity = document.getElementById('recentActivity');

        this.userData = null;
        this.tripsHistory = [];

        this.init();
    }

    init() {
        // Charger les données utilisateur
        this.loadUserData();

        // Gestion des formulaires
        this.profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        this.passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        this.securityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSecurityPreferences();
        });

        // Gestion des filtres d'historique
        document.getElementById('historyFilter').addEventListener('change', () => this.displayHistory());
        document.getElementById('historyDateFilter').addEventListener('change', () => this.displayHistory());

        // Validation en temps réel
        this.setupValidation();
    }

    async loadUserData() {
        try {
            // Simulation d'appel API
            await this.delay(500);
            this.userData = this.getMockUserData();
            this.tripsHistory = this.getMockTripsHistory();
            this.displayUserData();
            this.displayHistory();
            this.displayStats();
            this.displayRecentActivity();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showAlert('Erreur lors du chargement du profil', 'danger');
        }
    }

    getMockUserData() {
        return {
            id: 1,
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@email.com',
            telephone: '06 12 34 56 78',
            dateNaissance: '1990-05-15',
            pseudo: 'jeandupont',
            adresse: '123 Rue de la République, 75001 Paris',
            biographie: 'Passionné de voyages et d\'écologie, j\'aime partager mes trajets quotidiens.',
            memberSince: '2024-01-15',
            lastLogin: new Date().toLocaleDateString('fr-FR'),
            avatar: null,
            preferences: {
                emailNotifications: true,
                smsNotifications: false,
                profileVisibility: true
            }
        };
    }

    getMockTripsHistory() {
        return [
            {
                id: 1,
                type: 'driver',
                departure: 'Paris',
                arrival: 'Lyon',
                date: '2024-01-10',
                time: '08:30',
                price: 25,
                passengers: 3,
                rating: 4.8,
                status: 'completed'
            },
            {
                id: 2,
                type: 'passenger',
                departure: 'Lyon',
                arrival: 'Marseille',
                date: '2024-01-08',
                time: '14:20',
                price: 20,
                driver: 'Marie Martin',
                rating: 5.0,
                status: 'completed'
            },
            {
                id: 3,
                type: 'driver',
                departure: 'Paris',
                arrival: 'Bordeaux',
                date: '2024-01-05',
                time: '10:00',
                price: 30,
                passengers: 2,
                rating: 4.9,
                status: 'completed'
            }
        ];
    }

    displayUserData() {
        if (!this.userData) return;

        // Remplir le formulaire
        document.getElementById('nom').value = this.userData.nom;
        document.getElementById('prenom').value = this.userData.prenom;
        document.getElementById('email').value = this.userData.email;
        document.getElementById('telephone').value = this.userData.telephone;
        document.getElementById('dateNaissance').value = this.userData.dateNaissance;
        document.getElementById('pseudo').value = this.userData.pseudo;
        document.getElementById('adresse').value = this.userData.adresse;
        document.getElementById('biographie').value = this.userData.biographie;

        // Informations du compte
        document.getElementById('memberSince').textContent = new Date(this.userData.memberSince).toLocaleDateString('fr-FR');
        document.getElementById('lastLogin').textContent = this.userData.lastLogin;

        // Préférences de sécurité
        document.getElementById('emailNotifications').checked = this.userData.preferences.emailNotifications;
        document.getElementById('smsNotifications').checked = this.userData.preferences.smsNotifications;
        document.getElementById('profileVisibility').checked = this.userData.preferences.profileVisibility;
    }

    displayHistory() {
        const filter = document.getElementById('historyFilter').value;
        const dateFilter = document.getElementById('historyDateFilter').value;

        let filteredTrips = [...this.tripsHistory];

        // Filtrage par type
        if (filter !== 'all') {
            filteredTrips = filteredTrips.filter(trip => trip.type === filter);
        }

        // Filtrage par date
        if (dateFilter) {
            filteredTrips = filteredTrips.filter(trip => trip.date >= dateFilter);
        }

        if (filteredTrips.length === 0) {
            this.showNoHistoryMessage();
            return;
        }

        this.hideNoHistoryMessage();

        this.historyContainer.innerHTML = filteredTrips.map(trip => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <div class="d-flex align-items-center">
                                <div class="trip-icon me-3">
                                    <i class="bi bi-${trip.type === 'driver' ? 'car-front' : 'person'} display-6 text-${trip.type === 'driver' ? 'success' : 'info'}"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">${trip.departure} → ${trip.arrival}</h6>
                                    <p class="text-muted mb-0">
                                        <i class="bi bi-calendar-event me-1"></i>${this.formatDate(trip.date)}
                                        <i class="bi bi-clock ms-2 me-1"></i>${trip.time}
                                    </p>
                                    <small class="text-muted">
                                        ${trip.type === 'driver' ? 'Conducteur' : `Passager chez ${trip.driver}`}
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 text-center">
                            <div class="mb-2">
                                <span class="h5 text-success mb-0">${trip.price}€</span>
                            </div>
                            <small class="text-muted">Prix payé</small>
                        </div>
                        <div class="col-md-3 text-end">
                            <div class="rating mb-2">
                                ${'★'.repeat(Math.floor(trip.rating))}${'☆'.repeat(5 - Math.floor(trip.rating))}
                                <span class="text-muted ms-1">(${trip.rating})</span>
                            </div>
                            <span class="badge bg-success">${trip.status === 'completed' ? 'Terminé' : 'En cours'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayStats() {
        const totalTrips = this.tripsHistory.length;
        const totalEarned = this.tripsHistory
            .filter(trip => trip.type === 'driver')
            .reduce((sum, trip) => sum + trip.price, 0);
        const avgRating = this.tripsHistory.reduce((sum, trip) => sum + trip.rating, 0) / totalTrips;
        const ecoImpact = Math.round(totalTrips * 15.5); // Estimation CO2 économisé

        document.getElementById('totalTrips').textContent = totalTrips;
        document.getElementById('totalEarned').textContent = totalEarned + '€';
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
        document.getElementById('ecoImpact').textContent = ecoImpact;
    }

    displayRecentActivity() {
        const activities = [
            {
                type: 'trip_completed',
                message: 'Trajet Paris → Lyon terminé avec succès',
                date: '2024-01-10',
                icon: 'bi-check-circle text-success'
            },
            {
                type: 'rating_received',
                message: 'Nouvelle évaluation reçue (4.8/5)',
                date: '2024-01-09',
                icon: 'bi-star text-warning'
            },
            {
                type: 'profile_updated',
                message: 'Profil mis à jour',
                date: '2024-01-08',
                icon: 'bi-pencil text-info'
            }
        ];

        this.recentActivity.innerHTML = activities.map(activity => `
            <div class="d-flex align-items-start mb-3">
                <div class="activity-icon me-3">
                    <i class="bi ${activity.icon}"></i>
                </div>
                <div class="flex-grow-1">
                    <p class="mb-1">${activity.message}</p>
                    <small class="text-muted">${this.formatDate(activity.date)}</small>
                </div>
            </div>
        `).join('<hr>');
    }

    showNoHistoryMessage() {
        this.historyContainer.innerHTML = '';
        this.noHistoryMessage.classList.remove('d-none');
    }

    hideNoHistoryMessage() {
        this.noHistoryMessage.classList.add('d-none');
    }

    async saveProfile() {
        const formData = new FormData(this.profileForm);
        const profileData = {
            nom: formData.get('nom'),
            prenom: formData.get('prenom'),
            email: formData.get('email'),
            telephone: formData.get('telephone'),
            dateNaissance: formData.get('dateNaissance'),
            pseudo: formData.get('pseudo'),
            adresse: formData.get('adresse'),
            biographie: formData.get('biographie')
        };

        // Validation
        if (!this.validateProfileData(profileData)) {
            return;
        }

        try {
            // Simulation d'appel API
            await this.delay(1000);

            this.userData = { ...this.userData, ...profileData };
            this.showAlert('Profil mis à jour avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showAlert('Erreur lors de la sauvegarde du profil', 'danger');
        }
    }

    async changePassword() {
        const formData = new FormData(this.passwordForm);
        const passwordData = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Validation
        if (!this.validatePasswordData(passwordData)) {
            return;
        }

        try {
            // Simulation d'appel API
            await this.delay(1000);

            this.passwordForm.reset();
            this.showAlert('Mot de passe changé avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            this.showAlert('Erreur lors du changement de mot de passe', 'danger');
        }
    }

    async saveSecurityPreferences() {
        const formData = new FormData(this.securityForm);
        const preferences = {
            emailNotifications: formData.get('emailNotifications') === 'on',
            smsNotifications: formData.get('smsNotifications') === 'on',
            profileVisibility: formData.get('profileVisibility') === 'on'
        };

        try {
            // Simulation d'appel API
            await this.delay(500);

            this.userData.preferences = preferences;
            this.showAlert('Préférences sauvegardées', 'success');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showAlert('Erreur lors de la sauvegarde des préférences', 'danger');
        }
    }

    validateProfileData(data) {
        if (!data.nom || !data.prenom || !data.email || !data.pseudo) {
            this.showAlert('Veuillez remplir tous les champs obligatoires', 'warning');
            return false;
        }

        if (!this.isValidEmail(data.email)) {
            this.showAlert('Adresse email invalide', 'warning');
            return false;
        }

        return true;
    }

    validatePasswordData(data) {
        if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
            this.showAlert('Veuillez remplir tous les champs', 'warning');
            return false;
        }

        if (data.newPassword !== data.confirmPassword) {
            this.showAlert('Les mots de passe ne correspondent pas', 'warning');
            return false;
        }

        if (data.newPassword.length < 8) {
            this.showAlert('Le mot de passe doit contenir au moins 8 caractères', 'warning');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupValidation() {
        // Validation email en temps réel
        document.getElementById('email').addEventListener('blur', (e) => {
            if (e.target.value && !this.isValidEmail(e.target.value)) {
                e.target.classList.add('is-invalid');
            } else {
                e.target.classList.remove('is-invalid');
            }
        });

        // Validation mot de passe en temps réel
        document.getElementById('newPassword').addEventListener('input', (e) => {
            const password = e.target.value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password.length < 8) {
                e.target.classList.add('is-invalid');
            } else {
                e.target.classList.remove('is-invalid');
            }

            if (confirmPassword && password !== confirmPassword) {
                document.getElementById('confirmPassword').classList.add('is-invalid');
            } else if (confirmPassword) {
                document.getElementById('confirmPassword').classList.remove('is-invalid');
            }
        });

        document.getElementById('confirmPassword').addEventListener('input', (e) => {
            const password = document.getElementById('newPassword').value;
            const confirmPassword = e.target.value;

            if (password !== confirmPassword) {
                e.target.classList.add('is-invalid');
            } else {
                e.target.classList.remove('is-invalid');
            }
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Fonctions globales
function changeAvatar() {
    // Simulation de changement d'avatar
    window.profileManager.showAlert('Fonctionnalité de changement d\'avatar à implémenter', 'info');
}

function exportHistory() {
    // Simulation d'export d'historique
    window.profileManager.showAlert('Export de l\'historique en cours...', 'info');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});
