// Gestion des voitures de l'utilisateur
class CarManager {
    constructor() {
        this.cars = [];
        this.carForm = document.getElementById('carForm');
        this.carsContainer = document.getElementById('carsContainer');
        this.noCarsMessage = document.getElementById('noCarsMessage');
        this.addCarModal = new bootstrap.Modal(document.getElementById('addCarModal'));
        this.deleteCarModal = new bootstrap.Modal(document.getElementById('deleteCarModal'));
        this.carToDelete = null;

        this.init();
    }

    init() {
        // Générer les années
        this.generateYears();

        // Charger les voitures
        this.loadCars();

        // Gestion du formulaire
        this.carForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCar();
        });

        // Gestion de la marque pour afficher les modèles populaires
        document.getElementById('marque').addEventListener('change', (e) => {
            this.updateModeles(e.target.value);
        });

        // Validation de l'immatriculation
        document.getElementById('immatriculation').addEventListener('input', (e) => {
            this.validateImmatriculation(e.target);
        });
    }

    generateYears() {
        const currentYear = new Date().getFullYear();
        const yearSelect = document.getElementById('annee');

        for (let year = currentYear; year >= 1990; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    updateModeles(marque) {
        const modeleInput = document.getElementById('modele');
        const modeles = this.getModelesByMarque(marque);

        if (modeles.length > 0) {
            modeleInput.setAttribute('list', 'modeles');
            this.createDatalist('modeles', modeles);
        } else {
            modeleInput.removeAttribute('list');
            this.removeDatalist('modeles');
        }
    }

    getModelesByMarque(marque) {
        const modeles = {
            'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Twingo', 'Zoe'],
            'Peugeot': ['208', '308', '3008', '5008', '2008', '108', 'e-208'],
            'Citroën': ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'C4 Picasso'],
            'Volkswagen': ['Golf', 'Polo', 'Tiguan', 'Passat', 'Touran', 'ID.3'],
            'Toyota': ['Yaris', 'Corolla', 'C-HR', 'RAV4', 'Prius'],
            'Ford': ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Mondeo'],
            'BMW': ['Série 1', 'Série 3', 'X1', 'X3', 'i3'],
            'Audi': ['A1', 'A3', 'Q3', 'A4', 'Q5'],
            'Mercedes': ['Classe A', 'Classe B', 'GLA', 'Classe C']
        };

        return modeles[marque] || [];
    }

    createDatalist(id, options) {
        this.removeDatalist(id);

        const datalist = document.createElement('datalist');
        datalist.id = id;

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            datalist.appendChild(optionElement);
        });

        document.body.appendChild(datalist);
    }

    removeDatalist(id) {
        const existingDatalist = document.getElementById(id);
        if (existingDatalist) {
            existingDatalist.remove();
        }
    }

    validateImmatriculation(input) {
        const value = input.value.toUpperCase();
        const cleanValue = value.replace(/[^A-Z0-9]/g, '');

        // Format français: AA-123-BB
        if (cleanValue.length >= 2) {
            input.value = cleanValue.substring(0, 2) +
                         (cleanValue.length > 2 ? '-' + cleanValue.substring(2, 5) : '') +
                         (cleanValue.length > 5 ? '-' + cleanValue.substring(5, 7) : '');
        } else {
            input.value = cleanValue;
        }
    }

    async loadCars() {
        try {
            // Simulation d'appel API
            await this.delay(500);
            this.cars = this.getMockCars();
            this.displayCars();
            this.updateStats();
        } catch (error) {
            console.error('Erreur lors du chargement des voitures:', error);
            this.showAlert('Erreur lors du chargement des voitures', 'danger');
        }
    }

    getMockCars() {
        return [
            {
                id: 1,
                marque: 'Renault',
                modele: 'Clio',
                annee: 2020,
                couleur: 'Bleu',
                places: 5,
                energie: 'Essence',
                climatisation: 'Oui',
                immatriculation: 'AB-123-CD',
                description: 'Voiture en excellent état, très économique'
            },
            {
                id: 2,
                marque: 'Peugeot',
                modele: '208',
                annee: 2019,
                couleur: 'Blanc',
                places: 5,
                energie: 'Diesel',
                climatisation: 'Oui',
                immatriculation: 'EF-456-GH',
                description: 'Parfait pour les longs trajets'
            }
        ];
    }

    displayCars() {
        if (this.cars.length === 0) {
            this.showNoCarsMessage();
            return;
        }

        this.hideNoCarsMessage();

        this.carsContainer.innerHTML = this.cars.map(car => `
            <div class="card mb-4 shadow-sm" data-car-id="${car.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <div class="d-flex align-items-center mb-3">
                                <div class="car-icon me-3">
                                    <i class="bi bi-car-front display-4 text-success"></i>
                                </div>
                                <div>
                                    <h5 class="mb-1">${car.marque} ${car.modele}</h5>
                                    <p class="text-muted mb-0">
                                        <i class="bi bi-calendar me-1"></i>${car.annee} •
                                        <i class="bi bi-palette ms-2 me-1"></i>${car.couleur} •
                                        <i class="bi bi-people ms-2 me-1"></i>${car.places} places
                                    </p>
                                </div>
                            </div>

                            <div class="row g-2 mb-3">
                                <div class="col-md-4">
                                    <small class="text-muted">Énergie</small>
                                    <div><strong>${car.energie}</strong></div>
                                </div>
                                <div class="col-md-4">
                                    <small class="text-muted">Climatisation</small>
                                    <div><strong>${car.climatisation}</strong></div>
                                </div>
                                <div class="col-md-4">
                                    <small class="text-muted">Immatriculation</small>
                                    <div><strong>${car.immatriculation}</strong></div>
                                </div>
                            </div>

                            ${car.description ? `
                                <div class="mb-3">
                                    <small class="text-muted">Description</small>
                                    <p class="mb-0">${car.description}</p>
                                </div>
                            ` : ''}
                        </div>

                        <div class="col-md-4 text-end">
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary" onclick="editCar(${car.id})">
                                    <i class="bi bi-pencil me-1"></i>Modifier
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteCar(${car.id})">
                                    <i class="bi bi-trash me-1"></i>Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showNoCarsMessage() {
        this.carsContainer.innerHTML = '';
        this.noCarsMessage.classList.remove('d-none');
    }

    hideNoCarsMessage() {
        this.noCarsMessage.classList.add('d-none');
    }

    updateStats() {
        const totalCars = this.cars.length;
        const totalSeats = this.cars.reduce((sum, car) => sum + parseInt(car.places), 0);
        const avgPrice = 15; // Prix moyen mocké
        const avgRating = 4.8; // Note moyenne mockée

        document.getElementById('totalCars').textContent = totalCars;
        document.getElementById('totalSeats').textContent = totalSeats;
        document.getElementById('avgPrice').textContent = avgPrice + '€';
        document.getElementById('avgRating').textContent = avgRating;
    }

    async saveCar() {
        const formData = new FormData(this.carForm);
        const carData = {
            id: formData.get('carId') || Date.now(),
            marque: formData.get('marque'),
            modele: formData.get('modele'),
            annee: formData.get('annee'),
            couleur: formData.get('couleur'),
            places: formData.get('places'),
            energie: formData.get('energie'),
            climatisation: formData.get('climatisation'),
            immatriculation: formData.get('immatriculation'),
            description: formData.get('description')
        };

        // Validation
        if (!this.validateCarData(carData)) {
            return;
        }

        try {
            // Simulation d'appel API
            await this.delay(1000);

            const existingIndex = this.cars.findIndex(car => car.id == carData.id);

            if (existingIndex >= 0) {
                this.cars[existingIndex] = carData;
                this.showAlert('Voiture modifiée avec succès', 'success');
            } else {
                this.cars.push(carData);
                this.showAlert('Voiture ajoutée avec succès', 'success');
            }

            this.displayCars();
            this.updateStats();
            this.addCarModal.hide();
            this.carForm.reset();

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showAlert('Erreur lors de la sauvegarde', 'danger');
        }
    }

    validateCarData(carData) {
        if (!carData.marque || !carData.modele || !carData.annee || !carData.couleur || !carData.places || !carData.energie) {
            this.showAlert('Veuillez remplir tous les champs obligatoires', 'warning');
            return false;
        }

        if (!carData.immatriculation || carData.immatriculation.length < 9) {
            this.showAlert('Immatriculation invalide', 'warning');
            return false;
        }

        return true;
    }

    editCar(carId) {
        const car = this.cars.find(c => c.id == carId);
        if (!car) return;

        // Remplir le formulaire
        document.getElementById('carId').value = car.id;
        document.getElementById('marque').value = car.marque;
        document.getElementById('modele').value = car.modele;
        document.getElementById('annee').value = car.annee;
        document.getElementById('couleur').value = car.couleur;
        document.getElementById('places').value = car.places;
        document.getElementById('energie').value = car.energie;
        document.getElementById('climatisation').value = car.climatisation;
        document.getElementById('immatriculation').value = car.immatriculation;
        document.getElementById('description').value = car.description || '';

        // Mettre à jour le titre du modal
        document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Modifier la voiture';

        // Afficher le modal
        this.addCarModal.show();
    }

    confirmDeleteCar(carId) {
        this.carToDelete = this.cars.find(c => c.id == carId);
        if (!this.carToDelete) return;

        // Afficher les informations de la voiture à supprimer
        document.getElementById('carToDeleteInfo').innerHTML = `
            <div class="alert alert-warning">
                <strong>${this.carToDelete.marque} ${this.carToDelete.modele}</strong><br>
                Immatriculation: ${this.carToDelete.immatriculation}
            </div>
        `;

        // Afficher le modal de confirmation
        this.deleteCarModal.show();
    }

    async deleteCar() {
        if (!this.carToDelete) return;

        try {
            // Simulation d'appel API
            await this.delay(500);

            this.cars = this.cars.filter(car => car.id != this.carToDelete.id);
            this.displayCars();
            this.updateStats();
            this.deleteCarModal.hide();
            this.showAlert('Voiture supprimée avec succès', 'success');

        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            this.showAlert('Erreur lors de la suppression', 'danger');
        }
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
function editCar(carId) {
    window.carManager.editCar(carId);
}

function confirmDeleteCar(carId) {
    window.carManager.confirmDeleteCar(carId);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.carManager = new CarManager();

    // Gestionnaire pour le bouton de confirmation de suppression
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        window.carManager.deleteCar();
    });
});
