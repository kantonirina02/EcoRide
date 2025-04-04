const tokenCookieName = "accesstoken";
const RoleCookieName = "role";
const signoutBtn = document.getElementById("signout-btn");

signoutBtn.addEventListener("click", signout);

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
window.isConnected = isConnected;
window.getRole = getRole;
window.showAndHideElementsForRoles = showAndHideElementsForRoles;
// Optionnel : Exposer setupGlobalEventListeners si besoin de le rappeler
// window.setupGlobalEventListeners = setupGlobalEventListeners; // (Assurez-vous que la fonction setup existe et contient l'addEventListener pour signoutBtn)

console.log("script.js : Fonctions globales exposées sur window.");
