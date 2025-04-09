console.log("Exécution script script.js");

const tokenCookieName = "accesstoken";
const RoleCookieName = "role";
const creditsLocalStorageKey = "ecoRideUserCredits";

// --- Fonctions Cookies ---
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    let secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax" + secureAttribute;
    console.log(`Cookie set: ${name}=${value ? value.substring(0,10)+'...' : '""'}`); 
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    console.log(`Erasing cookie: ${name}`);
    let secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax' + secureAttribute;
}


// --- Fonctions Auth/Rôle ---
function setToken(token){
    console.log("Appel setToken");
    setCookie(tokenCookieName, token, 7); 
}

function getToken(){
    return getCookie(tokenCookieName); 
}

function getRole(){
    const role = getCookie(RoleCookieName) || 'disconnected';
    return role;
}

function isConnected() {
    const connected = getToken() != null;
    return connected;
}

function signout(){
    console.log("Appel signout");
    eraseCookie(tokenCookieName);
    eraseCookie(RoleCookieName);
    localStorage.removeItem(creditsLocalStorageKey); 
    window.location.replace('/'); 
}


// --- Fonctions Crédits ---
function getUserCredits() {
    const storedCredits = localStorage.getItem(creditsLocalStorageKey);
    if (storedCredits === null || isNaN(parseInt(storedCredits, 10))) {
        if (localStorage.getItem(creditsLocalStorageKey) === null) {
             console.log("Initialisation des crédits fictifs à 20.");
        }
        localStorage.setItem(creditsLocalStorageKey, '20');
        return 20;
    }
    
    return parseInt(storedCredits, 10);
}

function setUserCredits(newCreditAmount) {
    if (typeof newCreditAmount === 'number' && !isNaN(newCreditAmount)) {
        const credits = Math.max(0, Math.floor(newCreditAmount));
        localStorage.setItem(creditsLocalStorageKey, credits.toString());
        console.log(`Crédits fictifs mis à jour à : ${credits}`);
        
        const userCreditsSpan = document.getElementById('user-credits');
        if(userCreditsSpan) userCreditsSpan.textContent = credits;
    } else {
        console.error("Tentative de MàJ crédits avec valeur invalide:", newCreditAmount);
    }
}

function addUserCredits(amountToAdd) {
    const currentCredits = getUserCredits(); // Lecture de la valeur actuelle
    if (typeof amountToAdd === 'number' && amountToAdd > 0) {
        console.log(`Ajout de ${amountToAdd} crédits aux ${currentCredits} actuels.`);
        setUserCredits(currentCredits + amountToAdd); // Mise à jour
        return true;
    }
    console.error(`Tentative d'ajout crédits invalide: ${amountToAdd}`);
    return false;
}

function deductUserCredits(amountToDeduct) {
    const currentCredits = getUserCredits(); // Lecture de la valeur actuelle
    if (typeof amountToDeduct === 'number' && amountToDeduct > 0 && currentCredits >= amountToDeduct) {
        console.log(`Déduction de ${amountToDeduct} crédits des ${currentCredits} actuels.`);
        setUserCredits(currentCredits - amountToDeduct); // Mise à jour
        return true;
    }
    console.warn(`Déduction ${amountToDeduct} échouée. Crédits: ${currentCredits}`);
    return false;
}


// --- Gestion Affichage Conditionnel ---
function showAndHideElementsForRoles(){
    const userConnected = isConnected(); 
    const role = userConnected ? getRole() : 'disconnected'; 
    console.log(`showAndHide: Status -> connected=${userConnected}, role=${role}`);

    document.querySelectorAll('[data-show]').forEach(element => {
        const showCondition = element.dataset.show;
        let shouldBeVisible = false;
        switch(showCondition){
            case 'disconnected': shouldBeVisible = !userConnected; break;
            case 'connected': shouldBeVisible = userConnected; break;
            case 'admin': shouldBeVisible = userConnected && role === 'admin'; break;
            // Gérer plusieurs rôles dans data-show (ex: "employee admin")
            default:
                const rolesAllowed = showCondition.split(/[\s,]+/); 
                if(userConnected && rolesAllowed.includes(role)){
                    shouldBeVisible = true;
                }
                break;
        }
        element.classList.toggle('d-none', !shouldBeVisible);
    });
    console.log("<- Fin showAndHideElementsForRoles");
}


// --- Initialisation Globale et Écouteurs ---
function initializeGlobalElements() {
    console.log("Initialisation des éléments globaux (script.js)...");
    
    window.getUserCredits(); // Vérifie/Initialise les crédits
    console.log("Vérification/Initialisation des crédits effectuée.");
    window.showAndHideElementsForRoles(); 
    console.log("Affichage initial des rôles mis à jour.");

    // Attacher l'écouteur au bouton de déconnexion
    const signoutButton = document.getElementById("signout-btn");
    if (signoutButton && !signoutButton.hasAttribute('data-listener-attached')) {
        signoutButton.addEventListener("click", signout); 
        signoutButton.setAttribute('data-listener-attached', 'true');
        console.log("Écouteur ajouté au bouton de déconnexion.");
    } else if (!signoutButton) {
       
    }
}

document.addEventListener('DOMContentLoaded', initializeGlobalElements);

window.setCookie = setCookie;
window.getCookie = getCookie;
window.eraseCookie = eraseCookie;
window.setToken = setToken;
window.getToken = getToken;
window.getRole = getRole;
window.isConnected = isConnected;
window.getUserCredits = getUserCredits;
window.setUserCredits = setUserCredits; 
window.deductUserCredits = deductUserCredits;
window.addUserCredits = addUserCredits;
window.showAndHideElementsForRoles = showAndHideElementsForRoles; 

console.log("script.js : Fonctions globales exposées sur window.");

console.log("Fin exécution script.js"); 
