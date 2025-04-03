console.log("Exécution du script home.js");
function initializeHomePageLogic() {
    const searchForm = document.getElementById('search-form');
    const departInput = document.getElementById('depart-ville');
    const arriveeInput = document.getElementById('arrivee-ville');
    const dateInput = document.getElementById('date-voyage');
    const searchErrorDiv = document.getElementById('search-error');
    const searchResultDiv = document.getElementById('search-result');

    if (searchForm) {
        console.log("Formulaire de recherche trouvé dans home.js");
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Soumission du formulaire de recherche (home.js)');

            const departValue = departInput.value.trim();
            const arriveeValue = arriveeInput.value.trim();
            const dateValue = dateInput.value.trim();

            searchErrorDiv.textContent = '';
            searchResultDiv.textContent = '';

            let isValid = true;
            // --- Validation ---
            if (!departValue) {
                searchErrorDiv.textContent += 'Le lieu de départ est requis. ';
                departInput.classList.add('is-invalid');
                isValid = false;
            } else {
                departInput.classList.remove('is-invalid');
            }

            if (!arriveeValue) {
                searchErrorDiv.textContent += 'Le lieu d\'arrivée est requis. ';
                arriveeInput.classList.add('is-invalid');
                isValid = false;
            } else {
                 arriveeInput.classList.remove('is-invalid');
            }

            if (!dateValue) {
                searchErrorDiv.textContent += 'La date de voyage est requise. ';
                dateInput.classList.add('is-invalid');
                isValid = false;
            } else {
                const today = new Date();
                const selectedDate = new Date(dateValue);
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                     searchErrorDiv.textContent += 'La date ne peut pas être dans le passé. ';
                     dateInput.classList.add('is-invalid');
                     isValid = false;
                } else {
                    dateInput.classList.remove('is-invalid');
                }
            }

            if (!isValid) {
                console.log('Formulaire invalide (home.js).');
                return;
            }

            console.log('Formulaire valide (home.js). Redirection vers /covoiturages...');
            console.log('Départ:', departValue);
            console.log('Arrivée:', arriveeValue);
            console.log('Date:', dateValue);

            window.location.href = `/covoiturages?depart_ville=${encodeURIComponent(departValue)}&arrivee_ville=${encodeURIComponent(arriveeValue)}&date_voyage=${dateValue}`;

        });
    } else {
        console.error("L'élément #search-form n'a pas été trouvé dans home.js lors de l'initialisation.");
    }
}

initializeHomePageLogic();
