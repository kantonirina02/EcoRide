import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

const route404 = new Route("404", "Page introuvable", "/pages/404.html", []);
const getRouteByUrl = (url) => {
  let currentRoute = null;
 
  allRoutes.forEach((element) => {
    if (element.url == url) {
      currentRoute = element;
    }
  });
  return currentRoute != null ? currentRoute : route404;
};


//  Charger la Page 

const LoadContentPage = async () => {
  console.log("LoadContentPage: Démarrage du chargement..."); 

  const path = window.location.pathname; 
  console.log(`LoadContentPage: Chemin actuel = ${path}`); 

  // Trouver l'objet Route correspondant à cette URL
  const actualRoute = getRouteByUrl(path);
  console.log(`LoadContentPage: Route trouvée = ${actualRoute.title}`); 

  //  Vérifier les droits d'accès (Autorisation)
  const allRolesArray = actualRoute.authorize;
  console.log(`LoadContentPage: Rôles autorisés = [${allRolesArray}]`); 

  const userIsConnected = window.isConnected(); 
  const userRole = window.getRole(); 
  console.log(`LoadContentPage: Statut connexion = ${userIsConnected}, Rôle = ${userRole}`); 

  let isAuthorized = true;

  if (allRolesArray.length > 0) {
      
      if (allRolesArray.includes("disconnected")) {
          if (userIsConnected) { 
              isAuthorized = false; 
              console.warn("LoadContentPage: Accès non autorisé (doit être déconnecté), redirection vers /");
              window.location.replace("/"); 
          }
          
      }
      // La page est réservée à certains rôles connectés (ex: "user", "admin")
      else {
          
          if (!userIsConnected || !allRolesArray.includes(userRole)) {
              isAuthorized = false; 
              console.warn(`LoadContentPage: Accès non autorisé (role '${userRole}' non permis pour [${allRolesArray}]), redirection vers /`);
              window.location.replace("/"); 
          }
         
      }
  }

  // Si après vérification, l'utilisateur n'est pas autorisé, on arrête tout ici.

  if (!isAuthorized) {
      console.log("LoadContentPage: Arrêt car non autorisé."); // Debug
      return; // Stoppe l'exécution de LoadContentPage
  }
  console.log("LoadContentPage: Utilisateur autorisé."); // Debug

  // -Chargement et Affichage du Contenu (SI Autorisé) ---

  try {
      // Télécharger le contenu HTML de la page demandée
      console.log(`LoadContentPage: Fetching HTML depuis ${actualRoute.pathHtml}...`); // Debug
      const html = await fetch(actualRoute.pathHtml).then((data) => {
          // Vérifier si la requête fetch a réussi (statut HTTP 200 OK)
          if (!data.ok) {
              // Si erreur (ex: fichier non trouvé - 404), on lance une erreur pour être attrapée par le 'catch'
              throw new Error(`HTTP error! status: ${data.status} pour ${actualRoute.pathHtml}`);
          }
          // Si OK, on lit le contenu HTML sous forme de texte
          return data.text();
      });
      console.log("LoadContentPage: HTML récupéré."); // Debug

      // Injecter cet HTML dans la page principale
      // On cible l'élément <main id="main-page"> dans index.html et on remplace son contenu.
      const mainPageElement = document.getElementById("main-page");
      if(mainPageElement){
          mainPageElement.innerHTML = html;
          console.log("LoadContentPage: HTML injecté dans #main-page."); // Debug
      } else {
          console.error("LoadContentPage: Element #main-page non trouvé !");
          return; // Arrêter si la structure de base est manquante
      }


      // Mettre à jour la visibilité des éléments 
    
      if (window.showAndHideElementsForRoles) {
          console.log("LoadContentPage: Appel de showAndHideElementsForRoles..."); // Debug
          window.showAndHideElementsForRoles();
      } else {
          console.warn("LoadContentPage: Fonction showAndHideElementsForRoles non trouvée sur window.");
      }

      //  Supprimer l'ancien script spécifique (si un existait de la page précédente)
      
      const oldScript = document.getElementById("page-specific-script");
      if (oldScript) {
          console.log("LoadContentPage: Suppression de l'ancien script spécifique."); // Debug
          oldScript.remove();
      }

      // Charger le fichier JavaScript spécifique à cette page 
      if (actualRoute.pathJS && actualRoute.pathJS !== "") {
          console.log(`LoadContentPage: Chargement du script spécifique ${actualRoute.pathJS}...`); // Debug
          var scriptTag = document.createElement("script");
         
          scriptTag.setAttribute("type", "text/javascript");
          scriptTag.setAttribute("src", actualRoute.pathJS);
          scriptTag.setAttribute("id", "page-specific-script"); 
          
          document.body.appendChild(scriptTag);
      } else {
           console.log("LoadContentPage: Pas de script spécifique à charger pour cette route."); // Debug
      }

      // Mettre à jour le titre de l'onglet du navigateur
      document.title = actualRoute.title + " - " + websiteName;
      console.log(`LoadContentPage: Titre mis à jour: ${document.title}`); // Debug

  // --- Fin du bloc try ---
  } catch (error) {
      // Gestion des Erreurs ---
      // Si une erreur s'est produite dans le bloc 'try' (fetch échoué, HTML invalide, JS introuvable...),
      // cette partie s'exécute.
      console.error("LoadContentPage: Erreur lors du chargement du contenu:", error); // Affiche l'erreur détaillée dans la console

      // Affiche un message d'erreur simple à l'utilisateur dans la zone principale.
       const mainPageErrorElement = document.getElementById("main-page");
       if(mainPageErrorElement){
           mainPageErrorElement.innerHTML = `<div class="alert alert-danger">Impossible de charger le contenu de la page demandée. Veuillez réessayer ou contacter le support. (${error.message})</div>`;
       }
       document.title = "Erreur - " + websiteName; 

       // Si l'erreur est probablement un fichier non trouvé (404), on essaie d'afficher la page 404 définie.
       // C'est une vérification basique sur le message d'erreur.
       if (error.message && error.message.includes("404")) {
           console.log("LoadContentPage: Tentative d'affichage de la page 404..."); // Debug
           // On change l'URL dans la barre d'adresse SANS recharger la page
           window.history.pushState({}, "", "/404");
          
           LoadContentPage();
       }
       
  }
}; 



//  Gérer les clics sur les liens internes
// Fonction qui sera appelée à CHAQUE clic sur la page.
const routeEvent = (event) => {
 
  const targetElement = event.target.closest('[data-link]');

  // Si on a cliqué sur un élément qui a (ou est dans) un data-link...
  if (targetElement) {
      event.preventDefault(); // ...on empêche le navigateur de suivre le lien normalement (ce qui rechargerait la page).
      const targetHref = targetElement.getAttribute('href'); // On récupère l'URL du lien cliqué.
      console.log(`routeEvent: Clic intercepté sur data-link vers: ${targetHref}`); // Debug

      // On met à jour l'URL dans la barre d'adresse SANS recharger la page.
      window.history.pushState({}, "", targetHref);

      // On demande le chargement du contenu pour cette nouvelle URL.
      LoadContentPage();
  }
  
};
// On attache cette fonction à l'événement 'click' sur tout le document.
document.addEventListener('click', routeEvent);
console.log("Router.js: Écouteur de clic global attaché."); // Debug


// Quand l'utilisateur utilise les flèches du navigateur, l'URL change,
// mais la page ne se recharge pas automatiquement avec une SPA.
// L'événement 'popstate' est déclenché dans ce cas.
window.onpopstate = () => {
    console.log("Router.js: Événement onpopstate déclenché (Précédent/Suivant)."); // Debug
    
    LoadContentPage();
};



document.addEventListener('DOMContentLoaded', () => {
  console.log("Router.js: DOMContentLoaded - Chargement initial de la page."); // Debug
  // On appelle LoadContentPage une première fois pour charger le contenu
  // correspondant à l'URL sur laquelle l'utilisateur est arrivé.
  LoadContentPage();
});
