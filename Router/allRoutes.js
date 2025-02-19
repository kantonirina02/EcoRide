import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html"),
    new Route("/covoiturages","Covoiturages","/pages/covoiturages.html"),
    new Route("/signin","Connexion","/pages/signin.html", "/js/auth/signin.js"),
    new Route("/signup","Inscription","/pages/signup.html", "/js/auth/signup.js"),
    new Route("/account","Mon Profil","/pages/account.html"),
    new Route("/editPassword","Modifier mon mot de passe","/pages/editPassword.html"),

];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "EcoRide";
