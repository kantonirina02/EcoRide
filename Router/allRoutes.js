import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", [], "/js/home.js"),
    new Route("/covoiturages","Covoiturages","/pages/covoiturages.html", ["user"]),
    new Route("/signin","Connexion","/pages/signin.html", ["disconnected"], "/js/auth/signin.js"),
    new Route("/signup","Inscription","/pages/signup.html", ["disconnected"], "/js/auth/signup.js"),
    new Route("/account","Mon Profil","/pages/account.html", ["user", "employee", "admin"]),
    new Route("/editPassword","Modifier mon mot de passe", ["user", "employee", "admin"],"/pages/editPassword.html"),

];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "EcoRide";
