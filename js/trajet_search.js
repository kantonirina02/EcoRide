// Gestion de la recherche de trajets
class TrajetSearch {
    constructor() {
        this.searchForm = document.getElementById('searchForm');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.noResults = document.getElementById('noResults');
        this.paginationNav = document.getElementById('paginationNav');
        this.pagination = document.getElementById('pagination');

        this.currentResults = [];
        this.currentPage = 1;
        this.itemsPerPage = 6;

        this.init();
    }

    init() {
        // Gestion du formulaire de recherche
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });

        // Gestion du slider de prix
        const maxPrice = document.getElementById('maxPrice');
        const priceValue = document.getElementById('priceValue');
        maxPrice.addEventListener('input', (e) => {
            priceValue.textContent = e.target.value + '€';
        });

        // Gestion des filtres
        document.getElementById('sortBy').addEventListener('change', () => this.displayResults());
        document.getElementById('filterStatus').addEventListener('change', () => this.displayResults());
        document.getElementById('searchFilter').addEventListener('input', () => this.displayResults());
    }

    async performSearch() {
        const formData = new FormData(this.searchForm);
        const searchParams = {
            departure: formData.get('departure') || document.getElementById('departure').value,
            arrival: formData.get('arrival') || document.getElementById('arrival').value,
            date: formData.get('date') || document.getElementById('date').value,
            passengers: formData.get('passengers') || document.getElementById('passengers').value,
            maxPrice: formData.get('maxPrice') || document.getElementById('maxPrice').value
        };

        // Validation des champs requis
        if (!searchParams.departure || !searchParams.arrival || !searchParams.date) {
            this.showAlert('Veuillez remplir tous les champs obligatoires', 'danger');
            return;
        }

        this.showLoading();

        try {
            // Simulation d'appel API (à remplacer par l'appel réel)
            await this.delay(1000); // Simulation du temps de réponse
            this.currentResults = this.getMockResults(searchParams);
            this.currentPage = 1;
            this.displayResults();
            this.hideLoading();
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            this.showAlert('Erreur lors de la recherche. Veuillez réessayer.', 'danger');
            this.hideLoading();
        }
    }

    getMockResults(searchParams) {
        // Données mockées pour la démonstration
        return [
            {
                id: 1,
                departure: searchParams.departure || 'Toulouse',
                arrival: searchParams.arrival || 'Bordeaux',
                date: searchParams.date || '2024-01-15',
                time: '08:30',
                driver: 'Marie Dubois',
                driverRating: 4.8,
                price: 15,
                availableSeats: 3,
                totalSeats: 4,
                car: 'Renault Clio',
                status: 'disponible',
                description: 'Trajet régulier, ponctuel et confortable.'
            },
            {
                id: 2,
                departure: searchParams.departure || 'Toulouse',
                arrival: searchParams.arrival || 'Bordeaux',
                date: searchParams.date || '2024-01-15',
                time: '14:20',
                driver: 'Pierre Martin',
                driverRating: 4.6,
                price: 12,
                availableSeats: 1,
                totalSeats: 3,
                car: 'Peugeot 208',
                status: 'disponible',
                description: 'Voiture climatisée, musique à bord.'
            },
            {
                id: 3,
                departure: searchParams.departure || 'Toulouse',
                arrival: searchParams.arrival || 'Bordeaux',
                date: searchParams.date || '2024-01-15',
                time: '18:45',
                driver: 'Sophie Leroy',
                driverRating: 4.9,
                price: 18,
                availableSeats: 0,
                totalSeats: 4,
                car: 'Toyota Yaris',
                status: 'complet',
                description: 'Trajet avec pause café incluse.'
            }
        ].filter(trajet => {
            // Filtrage par prix
            if (trajet.price > parseInt(searchParams.maxPrice)) return false;
            // Filtrage par nombre de passagers
            if (trajet.availableSeats < parseInt(searchParams.passengers)) return false;
            return true;
        });
    }

    displayResults() {
        const sortBy = document.getElementById('sortBy').value;
        const filterStatus = document.getElementById('filterStatus').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

        // Tri et filtrage
        let filteredResults = [...this.currentResults];

        // Filtrage par statut
        if (filterStatus) {
            filteredResults = filteredResults.filter(trajet => trajet.status === filterStatus);
        }

        // Filtrage par texte
        if (searchFilter) {
            filteredResults = filteredResults.filter(trajet =>
                trajet.driver.toLowerCase().includes(searchFilter) ||
                trajet.car.toLowerCase().includes(searchFilter) ||
                trajet.description.toLowerCase().includes(searchFilter)
            );
        }

        // Tri
        filteredResults.sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return a.price - b.price;
                case 'seats':
                    return b.availableSeats - a.availableSeats;
                case 'date':
                default:
                    return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
            }
        });

        // Pagination
        const totalPages = Math.ceil(filteredResults.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedResults = filteredResults.slice(startIndex, endIndex);

        // Affichage
        if (filteredResults.length === 0) {
            this.showNoResults();
        } else {
            this.showResultsSection();
            this.renderResults(paginatedResults);
            this.renderPagination(totalPages);
        }
    }

    renderResults(results) {
        this.resultsContainer.innerHTML = results.map(trajet => `
            <div class="col-lg-6 col-xl-4">
                <div class="card h-100 shadow-sm hover-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="card-title mb-1">${trajet.departure} → ${trajet.arrival}</h5>
                                <p class="text-muted small mb-0">
                                    <i class="bi bi-calendar-event me-1"></i>${this.formatDate(trajet.date)}
                                    <i class="bi bi-clock ms-2 me-1"></i>${trajet.time}
                                </p>
                            </div>
                            <span class="badge bg-${trajet.status === 'disponible' ? 'success' : 'warning'}">
                                ${trajet.status}
                            </span>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <div class="avatar-placeholder me-2">
                                    <i class="bi bi-person-circle"></i>
                                </div>
                                <div>
                                    <strong>${trajet.driver}</strong>
                                    <div class="text-warning small">
                                        ${'★'.repeat(Math.floor(trajet.driverRating))}${'☆'.repeat(5 - Math.floor(trajet.driverRating))}
                                        <span class="text-muted">(${trajet.driverRating})</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <small class="text-muted">Véhicule</small>
                                <div><strong>${trajet.car}</strong></div>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Places</small>
                                <div><strong>${trajet.availableSeats}/${trajet.totalSeats}</strong></div>
                            </div>
                        </div>

                        <p class="card-text small text-muted mb-3">${trajet.description}</p>

                        <div class="d-flex justify-content-between align-items-center">
                            <div class="price-display">
                                <span class="h4 text-success mb-0">${trajet.price}€</span>
                                <small class="text-muted">/personne</small>
                            </div>
                            <button class="btn btn-${trajet.status === 'disponible' ? 'success' : 'secondary'} btn-sm"
                                    ${trajet.status !== 'disponible' ? 'disabled' : ''}
                                    onclick="selectTrajet(${trajet.id})">
                                <i class="bi bi-check-circle me-1"></i>
                                ${trajet.status === 'disponible' ? 'Réserver' : 'Complet'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPagination(totalPages) {
        if (totalPages <= 1) {
            this.paginationNav.style.display = 'none';
            return;
        }

        this.paginationNav.style.display = 'block';

        let paginationHtml = '';

        // Bouton précédent
        if (this.currentPage > 1) {
            paginationHtml += `<li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${this.currentPage - 1})">Précédent</a>
            </li>`;
        }

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHtml += `<li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>`;
            } else {
                paginationHtml += `<li class="page-item">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>`;
            }
        }

        // Bouton suivant
        if (this.currentPage < totalPages) {
            paginationHtml += `<li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${this.currentPage + 1})">Suivant</a>
            </li>`;
        }

        this.pagination.innerHTML = paginationHtml;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }

    showLoading() {
        this.loadingSpinner.classList.remove('d-none');
        this.resultsSection.style.display = 'none';
        this.noResults.classList.add('d-none');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('d-none');
    }

    showResultsSection() {
        this.resultsSection.style.display = 'block';
        this.noResults.classList.add('d-none');
    }

    showNoResults() {
        this.resultsSection.style.display = 'none';
        this.noResults.classList.remove('d-none');
    }

    clearResults() {
        this.resultsSection.style.display = 'none';
        this.noResults.classList.add('d-none');
        this.searchForm.reset();
        document.getElementById('priceValue').textContent = '25€';
    }

    showAlert(message, type) {
        // Créer l'alerte
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Supprimer automatiquement après 5 secondes
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

// Fonctions globales pour la pagination et la sélection
function changePage(page) {
    window.trajetSearch.currentPage = page;
    window.trajetSearch.displayResults();
}

function selectTrajet(trajetId) {
    // Rediriger vers la page de détail du covoiturage
    window.location.href = `covoiturage_detail.html?id=${trajetId}`;
}

function clearResults() {
    window.trajetSearch.clearResults();
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.trajetSearch = new TrajetSearch();
});
