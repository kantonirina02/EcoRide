console.log("Exécution script signin.js");

// Namespace pour cette page
window.ecoRideSigninPage = window.ecoRideSigninPage || {};

// --- Fonctions attachées au namespace ---

// Fonction pour gérer la tentative de connexion
window.ecoRideSigninPage.handleLogin = async function(event) {
    if(event) event.preventDefault(); // Empêche la soumission HTML si appelée depuis un formulaire
    console.log("Tentative de connexion...");

    // Cibler les éléments à l'intérieur de la fonction pour être sûr qu'ils existent
    const mailInput = document.getElementById("EmailInput");
    const passwordInput = document.getElementById("PasswordInput");
    const errorDiv = document.getElementById("signin-error");

    // Réinitialiser erreurs
    if(mailInput) mailInput.classList.remove("is-invalid");
    if(passwordInput) passwordInput.classList.remove("is-invalid");
    if(errorDiv) { errorDiv.textContent = ''; errorDiv.classList.add('d-none'); }

    const email = mailInput ? mailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    // Validation client simple
    if (!email || !password) {
        if(errorDiv) { errorDiv.textContent = "Email et mot de passe requis."; errorDiv.classList.remove('d-none'); }
        if(!email && mailInput) mailInput.classList.add("is-invalid");
        if(!password && passwordInput) passwordInput.classList.add("is-invalid");
        return;
    }

    // --- Appel API Backend ---
    try {
        // Adapte cette URL si ton API Symfony tourne ailleurs
        const apiUrl = 'https://127.0.0.1:8000/api/login_check';
        console.log(`Envoi requête POST vers ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email: email, password: password }) // Utilise bien 'email' ou ce qui est dans security.yaml
        });

        const data = await response.json();

        if (!response.ok) {
             console.error("Erreur API Login:", response.status, data);
             let errorMessage = data.message || "Email ou mot de passe incorrect.";
             if (response.status === 401) errorMessage = data.message || "Identifiants incorrects.";
             throw new Error(errorMessage);
        }

        // --- Succès ---
        console.log("Connexion réussie ! Réponse API:", data);
        const token = data.token;
        // Adapter la récupération du rôle selon la réponse réelle de ton API
        const userRole = data.user?.role || data.role || (JSON.parse(atob(token.split('.')[1]))?.roles?.[0]) || 'user'; // Différentes tentatives

        if (!token) throw new Error("Token JWT non reçu.");

        console.log(`Token: ...${token.slice(-10)}`); // Affiche juste la fin
        console.log(`Rôle: ${userRole}`);

        if(window.setToken && window.setCookie && window.RoleCookieName) {
            window.setToken(token);
            window.setCookie(window.RoleCookieName, userRole, 7);
            console.log("Cookies Token et Role définis.");

            // Redirection (utilise window.location.replace pour ne pas pouvoir faire retour)
            console.log(`Redirection basée sur le rôle '${userRole}'...`);
            if (userRole === 'admin') window.location.replace('/admin/dashboard');
            else if (userRole === 'employee') window.location.replace('/employe/avis');
            else window.location.replace('/account');
        } else {
            throw new Error("Fonctions cookies globales non trouvées.");
        }

    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        if(mailInput) mailInput.classList.add("is-invalid");
        if(passwordInput) passwordInput.classList.add("is-invalid");
        if(errorDiv) {
            errorDiv.textContent = error.message || "Une erreur s'est produite.";
            errorDiv.classList.remove('d-none');
        } else {
             alert(error.message || "Une erreur s'est produite.");
        }
    }
};

// --- Initialisation de la Page Signin (appelée à chaque chargement du script) ---
window.ecoRideSigninPage.initialize = function() {
    // Vérifier si déjà initialisé pour ne pas réattacher les listeners
     if (window.ecoRideSigninPage.isInitialized && document.getElementById('signin-form')) { // Vérifie aussi la présence du form
         console.log("Page Signin déjà initialisée.");
         return;
     }
    console.log("Initialisation page Signin...");

    const signinForm = document.getElementById("signin-form");
    const btnSignin = document.getElementById("btnSignin"); // Au cas où

     // Fonction pour attacher l'écouteur en évitant doublon
     const attachListenerIfNeeded = (element, eventName, handler) => {
        const listenerId = 'data-listener-' + eventName;
        if (element && !element.hasAttribute(listenerId)) {
            element.addEventListener(eventName, handler);
            element.setAttribute(listenerId, 'true');
             console.log(`Écouteur '${eventName}' attaché pour`, element.id || element);
            return true;
        }
        return false;
    };

    // Attacher l'écouteur au formulaire (préférable) ou au bouton
    if (!attachListenerIfNeeded(signinForm, "submit", window.ecoRideSigninPage.handleLogin)) {
         // Si le form n'a pas été trouvé ou listener déjà attaché, essaie le bouton
         if(attachListenerIfNeeded(btnSignin, "click", window.ecoRideAccountPage.handleLogin)){
              console.warn("Écouteur attaché au bouton Signin (formulaire #signin-form non trouvé ou listener déjà présent).");
         } else if (!signinForm && !btnSignin) {
             console.error("Ni #signin-form ni #btnSignin trouvés pour attacher l'écouteur.");
         }
    }

    // Marquer comme initialisé (utilise le namespace)
    window.ecoRideSigninPage.isInitialized = true;
     console.log("Page Signin initialisée.");
};

// --- Exécution ---
window.ecoRideSigninPage.initialize();
