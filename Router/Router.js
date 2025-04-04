import Route from "./Route.js"; // Importer la classe Route simple
// Importer RouteWithParams ET allRoutes depuis allRoutes.js
import { allRoutes, websiteName, RouteWithParams } from "./allRoutes.js";

// Création de la route 404 (elle peut être une Route simple)
const route404 = new Route("404", "Page introuvable", "/pages/404.html", []);

// Fonction pour récupérer la route et les paramètres
const getRouteByUrl = (url) => {
  let currentRoute = null;
  let params = {}; // Pour stocker les valeurs des paramètres

  // Parcours de toutes les routes définies dans allRoutes
  for (const route of allRoutes) {
      // Vérifier si la route a une propriété urlRegex (c'est donc une RouteWithParams)
      if (route.urlRegex) {
          const match = url.match(route.urlRegex);
          if (match) { // Si l'URL correspond à la regex
              currentRoute = route;
              // Extraire les paramètres
              if (route.params && match.length > 1) {
                  route.params.forEach((paramName, index) => {
                      params[paramName] = match[index + 1];
                  });
              }
              break; // Route trouvée, on arrête la boucle
          }
      } else {
          // C'est une Route simple, vérifier l'égalité exacte
          if (route.url === url) {
              currentRoute = route;
              break; // Route trouvée, on arrête la boucle
          }
      }
  }

  // Retourner la route trouvée (ou la 404) et les paramètres extraits
  return { route: currentRoute || route404, params: params };
};


// Fonction pour charger le contenu de la page
const LoadContentPage = async () => {
    console.log("LoadContentPage: Démarrage du chargement...");

    const path = window.location.pathname;
    console.log(`LoadContentPage: Chemin actuel = ${path}`);

    // Récupère la route ET les paramètres en appelant getRouteByUrl
    const { route: actualRoute, params: urlParams } = getRouteByUrl(path);
    console.log(`LoadContentPage: Route trouvée = ${actualRoute.title}, Params =`, urlParams);

    // --- Vérification des droits (Autorisation) ---
    const allRolesArray = actualRoute.authorize;
    console.log(`LoadContentPage: Rôles autorisés = [${allRolesArray}]`);

    const userIsConnected = window.isConnected(); // Fonction de script.js
    const userRole = window.getRole();       // Fonction de script.js
    let isAuthorized = true;

    if (allRolesArray.length > 0) {
        if (allRolesArray.includes("disconnected")) {
            if (userIsConnected) {
                isAuthorized = false;
                console.warn("LoadContentPage: Accès non autorisé (doit être déconnecté), redirection vers /");
                window.location.replace("/");
            }
        } else {
            if (!userIsConnected || !allRolesArray.includes(userRole)) {
                isAuthorized = false;
                console.warn(`LoadContentPage: Accès non autorisé (role '${userRole}' non permis pour [${allRolesArray}]), redirection vers /`);
                window.location.replace("/");
            }
        }
    }

    if (!isAuthorized) {
        console.log("LoadContentPage: Arrêt car non autorisé.");
        return;
    }
    console.log("LoadContentPage: Utilisateur autorisé.");

    // --- Chargement et Affichage du Contenu ---
    try {
        console.log(`LoadContentPage: Fetching HTML depuis ${actualRoute.pathHtml}...`);
        const html = await fetch(actualRoute.pathHtml).then((data) => {
            if (!data.ok) {
                throw new Error(`HTTP error! status: ${data.status} pour ${actualRoute.pathHtml}`);
            }
            return data.text();
        });
        console.log("LoadContentPage: HTML récupéré.");

        const mainPageElement = document.getElementById("main-page");
        if (mainPageElement) {
            mainPageElement.innerHTML = html;
            console.log("LoadContentPage: HTML injecté.");
        } else {
            console.error("LoadContentPage: Element #main-page non trouvé !");
            return;
        }

        if (window.showAndHideElementsForRoles) {
            console.log("LoadContentPage: Appel de showAndHideElementsForRoles...");
            window.showAndHideElementsForRoles();
        } else {
            console.warn("LoadContentPage: Fonction showAndHideElementsForRoles non trouvée.");
        }

        const oldScript = document.getElementById("page-specific-script");
        if (oldScript) {
            console.log("LoadContentPage: Suppression de l'ancien script spécifique.");
            oldScript.remove();
        }

        if (actualRoute.pathJS && actualRoute.pathJS !== "") {
            console.log(`LoadContentPage: Chargement du script spécifique ${actualRoute.pathJS}...`);
            var scriptTag = document.createElement("script");
            scriptTag.setAttribute("type", "text/javascript");
            scriptTag.setAttribute("src", actualRoute.pathJS);
            scriptTag.setAttribute("id", "page-specific-script");

            // Passer les paramètres au script en les mettant sur window AVANT de l'ajouter
            window.routeParams = urlParams;
            console.log("LoadContentPage: Paramètres stockés sur window.routeParams :", window.routeParams);

            document.body.appendChild(scriptTag);
        } else {
            console.log("LoadContentPage: Pas de script spécifique.");
        }

        document.title = actualRoute.title + " - " + websiteName;
        console.log(`LoadContentPage: Titre mis à jour: ${document.title}`);

    } catch (error) {
        console.error("LoadContentPage: Erreur lors du chargement:", error);
        const mainPageErrorElement = document.getElementById("main-page");
        if (mainPageErrorElement) {
            mainPageErrorElement.innerHTML = `<div class="alert alert-danger">Impossible de charger: ${error.message}</div>`;
        }
        document.title = "Erreur - " + websiteName;
        if (error.message && (error.message.includes("404") || error.message.includes("Failed to fetch"))) { // Gérer aussi l'erreur réseau
            console.log("LoadContentPage: Tentative d'affichage 404...");
            window.history.pushState({}, "", "/404");
            LoadContentPage(); // Relance pour charger la page 404
        }
    }
};


// --- Mise en Place des Écouteurs ---

// Gestion des clics sur les liens data-link
const routeEvent = (event) => {
    const targetElement = event.target.closest('[data-link]');
    if (targetElement) {
        event.preventDefault();
        const targetHref = targetElement.getAttribute('href');
        console.log(`routeEvent: Clic intercepté vers: ${targetHref}`);
        window.history.pushState({}, "", targetHref);
        LoadContentPage();
    }
};
document.addEventListener('click', routeEvent);
console.log("Router.js: Écouteur clic global attaché.");

// Gestion Précédent/Suivant navigateur
window.onpopstate = () => {
    console.log("Router.js: onpopstate déclenché.");
    LoadContentPage();
};

// Chargement initial
document.addEventListener('DOMContentLoaded', () => {
    console.log("Router.js: DOMContentLoaded - Chargement initial.");
    LoadContentPage();
});
