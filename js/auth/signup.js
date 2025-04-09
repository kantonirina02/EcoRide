console.log("Exécution script signup.js");

// Namespace pour cette page
window.ecoRideSignupPage = window.ecoRideSignupPage || {};

// --- Fonctions attachées au Namespace ---

// Fonction utilitaire pour ajouter/enlever classes de validation
window.ecoRideSignupPage.toggleValidationClasses = function(inputElement, isValid) {
    if (!inputElement) return;
    inputElement.classList.toggle('is-valid', isValid);
    inputElement.classList.toggle('is-invalid', !isValid);
};

// Validation Confirmation
window.ecoRideSignupPage.validateConfirmationPassword = function(inputPwdElement, inputConfirmPwdElement) {
    const ns = window.ecoRideSignupPage;
    if (!inputConfirmPwdElement) { console.warn("Confirm Pwd Element non trouvé"); return false;}

    const pwdValue = inputPwdElement ? inputPwdElement.value : null;
    const confirmValue = inputConfirmPwdElement.value;
    let isValid = false;

    if (pwdValue && confirmValue && pwdValue === confirmValue) {
        isValid = true;
    }
    // console.log(`  [ConfirmPwd] Valeurs: '${pwdValue}' vs '${confirmValue}'. Valide: ${isValid}`); // Log détaillé si besoin

    ns.toggleValidationClasses(inputConfirmPwdElement, isValid);
    if (confirmValue && !isValid) {
        inputConfirmPwdElement.classList.add('is-invalid'); // Force invalid si rempli mais différent
        isValid = false;
    } else if (!confirmValue) {
         isValid = false; // Invalide si vide
    }
    return isValid;
};

// Validation Mot de passe
window.ecoRideSignupPage.validatePassword = function(inputPwdElement) {
    const ns = window.ecoRideSignupPage;
    if (!inputPwdElement) { console.warn("Pwd Element non trouvé"); return false; }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const passwordUser = inputPwdElement.value;
    const isValid = passwordRegex.test(passwordUser);
    // console.log(`  [Password] Valeur: '${passwordUser}'. Regex valide: ${isValid}`); // Log détaillé si besoin
    ns.toggleValidationClasses(inputPwdElement, isValid);

    const inputConfirmPwdElement = document.getElementById("ValidatePasswordInput");
    ns.validateConfirmationPassword(inputPwdElement, inputConfirmPwdElement);

    return isValid;
};

// Validation Email
window.ecoRideSignupPage.validateMail = function(inputElement) {
    const ns = window.ecoRideSignupPage;
    if (!inputElement) { console.warn("Email Element non trouvé"); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = inputElement.value;
    const isValid = emailRegex.test(mailUser);
    // console.log(`  [Email] Valeur: '${mailUser}'. Regex valide: ${isValid}`); // Log détaillé si besoin
    ns.toggleValidationClasses(inputElement, isValid);
    return isValid;
};

// Validation Requis
window.ecoRideSignupPage.validateRequired = function(inputElement) {
    const ns = window.ecoRideSignupPage;
    const inputId = inputElement ? inputElement.id : 'inconnu';
    if (!inputElement) { console.warn(`validateRequired appelé avec input null/undefined pour ID: ${inputId}`); return false;}
    const isValid = inputElement.value.trim() !== '';
    // console.log(`  [Required:${inputId}] Valide: ${isValid}`); // Log détaillé si besoin
    ns.toggleValidationClasses(inputElement, isValid);
    return isValid;
};

// Fonction de Validation Globale (appelée par keyup et submit)
window.ecoRideSignupPage.validateForm = function(isSubmit = false) {
    const ns = window.ecoRideSignupPage;
    if(!isSubmit) console.log("--> Appel validateForm (keyup)"); // Log seulement pour keyup
    // Cibler éléments
    const inputPseudo = document.getElementById("PseudoInput");
    const inputMail = document.getElementById("EmailInput");
    const inputPassword = document.getElementById("PasswordInput");
    const inputValidationPassword = document.getElementById("ValidatePasswordInput");
    const btnValidation = document.getElementById("btn-validation-inscription");
    // Pas de Nom/Prénom ici

    // Appeler validateurs
    const pseudoOk = ns.validateRequired(inputPseudo);
    const mailOk = ns.validateMail(inputMail);
    const passwordOk = ns.validatePassword(inputPassword);
    const passwordConfirmOk = ns.validateConfirmationPassword(inputPassword, inputValidationPassword);

    const isFormGloballyValid = pseudoOk && mailOk && passwordOk && passwordConfirmOk;

    if (btnValidation) {
        // Mettre à jour 'disabled' basé sur l'état global, sauf si c'est un submit
        if (!isSubmit) {
             btnValidation.disabled = !isFormGloballyValid;
             // console.log(`  [Bouton] État final désactivé (keyup): ${btnValidation.disabled}`); // Log moins utile
        }
    } else { console.error("Bouton Inscription non trouvé dans validateForm !"); }

     if(!isSubmit) console.log(`<-- Fin validateForm (keyup). Valide globale: ${isFormGloballyValid}`);
    return isFormGloballyValid;
};

// Fonction pour gérer la soumission
window.ecoRideSignupPage.handleSubmit = async function(event) {
    // Log et preventDefault doivent être les premières choses
    console.log("handleSubmit: Événement reçu :", event);
    if (!event) { console.error("handleSubmit: ERREUR - Aucun événement reçu !"); return; }
    try {
         event.preventDefault();
         console.log("handleSubmit: event.preventDefault() appelé avec succès.");
    } catch (e) { console.error("handleSubmit: ERREUR lors de preventDefault() :", e); return; }

    console.log("handleSubmit: Tentative de soumission après preventDefault.");
    const ns = window.ecoRideSignupPage;
    const errorDiv = document.getElementById('signup-error');
    const successDiv = document.getElementById('signup-success');
    const btnValidation = document.getElementById("btn-validation-inscription");
    const signupForm = document.getElementById("signup-form");

    // Réinitialiser les messages
    if(errorDiv) { errorDiv.textContent = ''; errorDiv.classList.add('d-none'); }
    if(successDiv) { successDiv.textContent = ''; successDiv.classList.add('d-none'); }

    // Revalider strictement au submit
    console.log("handleSubmit: Revalidation avant envoi...");
    const isFormSubmitValid = ns.validateForm(true); // Passe true pour indiquer que c'est un submit

    if (isFormSubmitValid) {
        console.log("handleSubmit: Formulaire valide pour API.");
         // Recibler les inputs pour les valeurs
         const inputPseudo = document.getElementById("PseudoInput");
         const inputMail = document.getElementById("EmailInput");
         const inputPassword = document.getElementById("PasswordInput");
         // Nom/Prénom pour l'API car requis par l'entité backend
         const inputNom = { value: inputPseudo.value.trim() }; // Utilise le pseudo
         const inputPrenom = { value: "Utilisateur" };      // Valeur par défaut

         // Vérifier si les éléments essentiels existent
         if(!inputPseudo || !inputMail || !inputPassword) {
             console.error("handleSubmit: Champs Pseudo, Email ou Password non trouvés !");
             if(errorDiv) { errorDiv.textContent = 'Erreur interne formulaire.'; errorDiv.classList.remove('d-none'); }
             return;
         }

         const dataToSend = {
             pseudo: inputPseudo.value.trim(),
             email: inputMail.value.trim(),
             password: inputPassword.value,
             nom: inputNom.value,     // Utilise les valeurs par défaut
             prenom: inputPrenom.value
         };
         console.log("handleSubmit: Données à envoyer:", dataToSend);

         // UI pendant l'appel
         if(btnValidation) btnValidation.disabled = true;
         if(successDiv) { successDiv.textContent = 'Inscription en cours...'; successDiv.classList.remove('d-none'); }

         // --- Appel API ---
         try {
             const apiUrl = 'https://127.0.0.1:8000/api/register';
             console.log(`handleSubmit: Envoi requête POST vers ${apiUrl}`);

             const response = await fetch(apiUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                 body: JSON.stringify(dataToSend)
             });

             let responseData = {};
             try {
                 responseData = await response.json();
             } catch(e) {
                 // Si la réponse n'est pas JSON (ex: erreur 500 HTML), crée un message d'erreur
                 console.warn("Réponse non JSON reçue:", response.status, response.statusText);
                 responseData = { message: `Erreur serveur ${response.status} (${response.statusText || 'Réponse invalide'})` };
            }

             if (!response.ok) {
                  console.error("Erreur API Inscription:", response.status, responseData);
                  throw new Error(responseData.message || `Erreur ${response.status}`);
             }

             // --- Succès ---
             console.log("handleSubmit: Inscription API réussie:", responseData);
             if(successDiv){
                  successDiv.textContent = (responseData.message || "Inscription réussie !") + " Redirection vers la connexion...";
                  successDiv.classList.remove('d-none');
             } else { alert((responseData.message || "Inscription réussie !") + " Vous allez être redirigé.");}

             // Laisse le formulaire désactivé
             if(signupForm) signupForm.querySelectorAll('input, button').forEach(el => el.disabled = true);

             // Redirection
             setTimeout(() => {
                 console.log("handleSubmit: Redirection vers /signin");
                 window.location.href = '/signin';
             }, 2500);

         } catch (error) {
             // --- Gestion Erreur ---
             console.error("handleSubmit: Erreur lors de l'inscription API:", error);
             if(errorDiv) {
                 errorDiv.textContent = error.message || "Une erreur inconnue s'est produite.";
                 errorDiv.classList.remove('d-none');
             } else { alert(error.message || "Une erreur inconnue s'est produite."); }
             // Réactiver le bouton en cas d'erreur
             if(btnValidation) btnValidation.disabled = false;
             if(successDiv) successDiv.classList.add('d-none'); // Masquer "Envoi en cours"
         }
    } else {
         console.log("handleSubmit: Soumission bloquée car formulaire invalide.");
         if(errorDiv) {
             errorDiv.textContent = 'Veuillez corriger les erreurs indiquées dans le formulaire.';
             errorDiv.classList.remove('d-none');
         }
         // S'assurer que le bouton est désactivé
         if(btnValidation) btnValidation.disabled = true;
    }
}; // Fin handleSubmit


// --- Initialisation de la Page Signup ---
window.ecoRideSignupPage.initialize = function() {
    // Vérifie si le script a déjà attaché les listeners pour éviter les doublons
    if (window.ecoRideSignupPage.isInitialized && document.getElementById('signup-form')) {
        console.log("Page Signup déjà initialisée.");
        window.ecoRideSignupPage.validateForm(false); // Met à jour l'état initial du bouton
        return;
    }
    console.log("Initialisation page Signup...");
    const ns = window.ecoRideSignupPage;

    // Cibler les éléments pour attacher les listeners
    const signupForm = document.getElementById("signup-form");
    const inputsToValidate = [
        document.getElementById("PseudoInput"),
        document.getElementById("EmailInput"),
        document.getElementById("PasswordInput"),
        document.getElementById("ValidatePasswordInput")
        // Pas besoin de Nom/Prénom ici car ils n'existent pas dans le HTML
    ];
    const btnValidation = document.getElementById("btn-validation-inscription");

     // Fonction utilitaire pour attacher listener une fois
     const attachListenerIfNeeded = (element, eventName, handler) => {
         const listenerId = 'data-listener-' + eventName;
         if (element && !element.hasAttribute(listenerId)) {
             element.addEventListener(eventName, handler);
             element.setAttribute(listenerId, 'true');
             console.log(`Écouteur '${eventName}' attaché pour`, element.id || element);
             return true;
         } else if (!element) {
             console.error(`Élément ${element?.id || 'inconnu'} non trouvé pour attacher '${eventName}'`);
         }
         return false;
     };

     // Attacher keyup aux inputs qui existent
     let keyupAttachedCount = 0;
     inputsToValidate.forEach((input) => {
         // On n'attache que si l'élément est trouvé
         if(input && attachListenerIfNeeded(input, "keyup", () => ns.validateForm(false))) {
            keyupAttachedCount++;
         }
     });
     console.log(`${keyupAttachedCount} écouteurs Keyup attachés.`);

    // Attacher submit au formulaire
    attachListenerIfNeeded(signupForm, "submit", ns.handleSubmit);

    // État initial du bouton et validation visuelle
    if (btnValidation) btnValidation.disabled = true;
    ns.validateForm(false); // Appliquer styles initiaux (rouge si vide)

    // Marquer comme initialisé
    window.ecoRideSignupPage.isInitialized = true;
     console.log("Page Signup initialisée.");
};

// --- Exécution ---
window.ecoRideSignupPage.initialize();
