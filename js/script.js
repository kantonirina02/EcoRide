const tokenCookieName = "accesstoken";
const RoleCookieName = "role";
const creditsLocalStorageKey = "ecoRideUserCredits";

function getRole(){
    return getCookie(RoleCookieName) || 'disconnected';
}

function signout(){
    eraseCookie(tokenCookieName);
    eraseCookie(RoleCookieName);
    window.location.reload();
}

function setToken(token){
    setCookie(tokenCookieName, token, 7);
}

function getToken(){
    return getCookie(tokenCookieName);
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    let secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax" + secureAttribute;
    console.log(`Cookie set: ${name}=${value}`);
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {   
    console.log(`Erasing cookie: ${name}`);
    let secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax' + secureAttribute;
}

function isConnected() {
    // return (getToken() == null || getToken == undefined); // Ancienne version potentiellement problématique
    return getToken() != null; // Plus simple et sûr
}

    // --- Gestion Crédits (Simulation) ---
/**
 * Récupère le nombre de crédits de l'utilisateur depuis localStorage.
 * Initialise à 20 si non défini.
 * @returns {number} Le nombre de crédits.
 */
function getUserCredits() {
    const storedCredits = localStorage.getItem(creditsLocalStorageKey);
    // Si rien n'est stocké ou si ce n'est pas un nombre valide, on initialise à 20
    if (storedCredits === null || isNaN(parseInt(storedCredits, 10))) {
        console.log("Initialisation des crédits fictifs à 20.");
        localStorage.setItem(creditsLocalStorageKey, '20');
        return 20;
    }
    return parseInt(storedCredits, 10);
}

/**
 * Met à jour le nombre de crédits dans localStorage.
 * @param {number} newCreditAmount - Le nouveau montant de crédits.
 */
function setUserCredits(newCreditAmount) {
    if (typeof newCreditAmount === 'number' && !isNaN(newCreditAmount)) {
        const credits = Math.max(0, Math.floor(newCreditAmount)); // Assure positif et entier
        localStorage.setItem(creditsLocalStorageKey, credits.toString());
        console.log(`Crédits fictifs mis à jour à : ${credits}`);
        // TODO: Mettre à jour l'affichage des crédits si visible quelque part (ex: navbar, profil)
    } else {
        console.error("Tentative de mise à jour des crédits avec une valeur invalide:", newCreditAmount);
    }
}

/**
 * Décrémente les crédits de l'utilisateur.
 * @param {number} amountToDeduct - Le nombre de crédits à déduire.
 * @returns {boolean} True si la déduction a réussi, False sinon (crédits insuffisants).
 */
function deductUserCredits(amountToDeduct) {
    const currentCredits = getUserCredits();
    if (typeof amountToDeduct === 'number' && amountToDeduct > 0 && currentCredits >= amountToDeduct) {
        setUserCredits(currentCredits - amountToDeduct);
        return true; // Succès
    }
    console.warn(`Tentative de déduction de ${amountToDeduct} échouée. Crédits actuels: ${currentCredits}`);
    return false; // Échec
}
getUserCredits();
 
// --- Gestion Affichage conditionnel
function showAndHideElementsForRoles(){
    const userConnected = isConnected();
    const role = userConnected ? getRole() : 'disconnected';

    let allElementsToEdit = document.querySelectorAll('[data-show]');

    allElementsToEdit.forEach(element =>{

        const showCondition = element.dataset.show;
        let shouldBeVisible = false;

        switch(showCondition){
            case 'disconnected': 
                shouldBeVisible = !userConnected;
                break;
            case 'connected': 
                shouldBeVisible = userConnected;
                break;
            case 'admin': 
                shouldBeVisible = userConnected && role === 'admin';
                break;
            case 'employee': 
            shouldBeVisible = userConnected && (role === 'employee' /*|| role === 'admin'*/);
                break;
            case 'user': 
            shouldBeVisible = userConnected && (role === 'user' /*|| role === 'employee' || role === 'admin'*/);
                break;
            default:
                const rolesAllowed = showCondition.split(/[\s,]+/);
                if(userConnected && rolesAllowed.includes(role)){
                    shouldBeVisible = true;
                }
                break;
        }
        if (shouldBeVisible) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    });
}

// Fonction pour initialiser les éléments qui existent dès le début
function initializeGlobalElements() {
    console.log("Initialisation des éléments globaux (script.js)...");

    getUserCredits();
    console.log("Vérification/Initialisation des crédits effectuée.");

    showAndHideElementsForRoles();
    console.log("Affichage initial des rôles mis à jour.");

    // Attacher l'écouteur au bouton de déconnexion SEULEMENT s'il existe
    const signoutButton = document.getElementById("signout-btn");
    if (signoutButton) {
        // Vérifier s'il n'est pas déjà attaché pour éviter les doublons
        if (!signoutButton.hasAttribute('data-listener-attached')) {
            signoutButton.addEventListener("click", signout);
            signoutButton.setAttribute('data-listener-attached', 'true');
            console.log("Écouteur ajouté au bouton de déconnexion.");
        }
    } else {
        console.log("Bouton de déconnexion non trouvé (utilisateur probablement déconnecté).");
    }
}
document.addEventListener('DOMContentLoaded', initializeGlobalElements);

window.isConnected = isConnected;
window.getRole = getRole;
window.showAndHideElementsForRoles = showAndHideElementsForRoles;
window.getUserCredits = getUserCredits;
window.deductUserCredits = deductUserCredits;

console.log("script.js : Fonctions globales exposées sur window.");
