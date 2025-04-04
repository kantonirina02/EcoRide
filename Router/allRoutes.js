import Route from "./Route.js";

const createRegex = (path) => {
    return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(\\d+)") + "$");
}
export class RouteWithParams extends Route {
    constructor(url, title, pathHtml, authorize, pathJS = "") {
       super(url, title, pathHtml, authorize, pathJS);
       this.urlRegex = createRegex(url); // Crée la regex
       // Trouve les noms des paramètres (ex: ['id'] pour /covoiturages/:id)
       this.params = url.match(/:(\w+)/g)?.map(match => match.substring(1)) || [];
   }
}

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", [], "/js/home.js"),
    new Route("/mentions-legales", "Mentions légales", "/pages/mentionsLegales.html", []),
    new Route("/covoiturages","Covoiturages","/pages/covoiturages.html", [], "/js/covoiturages.js"),
    new RouteWithParams("/covoiturages/:id","Détails Covoiturage","/pages/covoiturage_detail.html", [], "/js/covoiturage_detail.js"),
    new Route("/signin","Connexion","/pages/signin.html", ["disconnected"], "/js/auth/signin.js"),
    new Route("/signup","Inscription","/pages/signup.html", ["disconnected"], "/js/auth/signup.js"),
    new Route("/account","Mon Profil","/pages/account.html", ["user", "employee", "admin"]),
    new Route("/editPassword","Modifier mon mot de passe", ["user", "employee", "admin"],"/pages/editPassword.html"),

];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "EcoRide";
