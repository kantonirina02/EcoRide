console.log("Exécution du script signup.js");

const signupForm = document.getElementById("signup-form");
const inputPseudo = document.getElementById("PseudoInput");
const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidationPassword = document.getElementById("ValidatePasswordInput");
const btnValidation = document.getElementById("btn-validation-inscription");
const errorDiv = document.getElementById('signup-error');
const successDiv = document.getElementById('signup-success');

if (inputPseudo) inputPseudo.addEventListener("keyup", validateForm);
if (inputMail) inputMail.addEventListener("keyup", validateForm);
if (inputPassword) inputPassword.addEventListener("keyup", validateForm);
if (inputValidationPassword) inputValidationPassword.addEventListener("keyup", validateForm);
if (inputPassword) inputPassword.addEventListener("keyup", () => { validateConfirmationPassword(inputPassword, inputValidationPassword); validateForm(); }); 

//Function permettant de valider tout le formulaire
function validateForm(){
    const pseudoOk = validateRequired(inputPseudo);
    const mailOk = validateMail(inputMail);
    const passwordOk = validatePassword(inputPassword);
    const passwordConfirmOk = validateConfirmationPassword(inputPassword, inputValidationPassword);

    if(pseudoOk && mailOk && passwordOk && passwordConfirmOk){
        btnValidation.disabled = false;
    }
    else{
        btnValidation.disabled = true;
    }
    return pseudoOk && mailOk && passwordOk && passwordConfirmOk;
}
function validateConfirmationPassword(inputPwd, inputConfirmPwd){
    if (inputPwd && inputConfirmPwd && inputPwd.value && inputConfirmPwd.value) {
        if (inputPwd.value === inputConfirmPwd.value) {
            inputConfirmPwd.classList.add("is-valid");
            inputConfirmPwd.classList.remove("is-invalid");
            return true;
        } else {
            inputConfirmPwd.classList.add("is-invalid");
            inputConfirmPwd.classList.remove("is-valid");
            return false;
        }
    } else if (inputConfirmPwd && inputConfirmPwd.value) {
         inputConfirmPwd.classList.add("is-invalid");
         inputConfirmPwd.classList.remove("is-valid");
         return false;
    } else if (inputConfirmPwd) {
         
         inputConfirmPwd.classList.remove("is-valid", "is-invalid");
         return false; 
    }
    return false; 
}

function validatePassword(input){
    if (!input) return false;
    //Définir mon regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const passwordUser = input.value;
    if(passwordUser.match(passwordRegex)){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        validateConfirmationPassword(inputPassword, inputValidationPassword);
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        validateConfirmationPassword(inputPassword, inputValidationPassword);
        return false;
    }
}
function validateMail(input){
    if (!input) return false;
    //Définir mon regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = input.value;
    if(mailUser.match(emailRegex)){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

function validateRequired(input) {
    if (!input) return false;
    if (input.value.trim() !== '') { 
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        return false;
    }
}
// --- Gestion de la Soumission du Formulaire ---
if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche la soumission HTML
        console.log("Tentative de soumission du formulaire d'inscription...");

        // Réinitialiser les messages globaux
        if(errorDiv) { errorDiv.textContent = ''; errorDiv.classList.add('d-none'); }
        if(successDiv) { successDiv.textContent = ''; successDiv.classList.add('d-none'); }

        // --- Re-valider TOUT le formulaire au moment du clic ---
        const isFormGloballyValid = validateForm();

        if (isFormGloballyValid) {
            console.log("Formulaire valide au moment de la soumission. Simulation...");

            // Récupérer les données 
            const pseudo = inputPseudo.value.trim();
            const email = inputMail.value.trim();
            const password = inputPassword.value; 

            // Afficher succès, désactiver formulaire, rediriger après délai

            if(successDiv){
                successDiv.textContent = "Inscription réussie ! Redirection vers la connexion...";
                successDiv.classList.remove('d-none');
            } else {
                alert("Inscription réussie ! Redirection..."); // Fallback
            }


            // Désactiver les champs et le bouton
            signupForm.querySelectorAll('input, button').forEach(el => el.disabled = true);

            // Rediriger vers la page de connexion après 2 secondes
            setTimeout(() => {
                // Utiliser le système de navigation si possible, sinon redirection simple
                // Pour l'instant, redirection simple:
                window.location.href = '/signin';
            }, 2000);

        } else {
            console.log("Soumission bloquée car le formulaire est invalide.");
             if(errorDiv){
                 errorDiv.textContent = 'Veuillez corriger les erreurs dans le formulaire.';
                 errorDiv.classList.remove('d-none');
             } else {
                 alert('Veuillez corriger les erreurs dans le formulaire.');
             }
        }
    });
} else {
    console.error("Le formulaire #signup-form est introuvable.");
}

// Appel initial pour définir l'état du bouton au chargement
validateForm();
