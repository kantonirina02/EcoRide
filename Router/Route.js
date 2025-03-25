export default class Route {
    constructor(url, title, pathHtml, authorize, pathJS = "") {
      this.url = url;
      this.title = title;
      this.pathHtml = pathHtml;
      this.pathJS = pathJS;
      this.authorize = authorize;
    }
}

/*
[] -> Tout le monde peut accéder à la page
["disconnected"] -> réserver aux utilisateurs non connectés
["Passager", "Chauffeur"] -> Réserver aux passagers et aux chauffeurs
["admin"] -> Réserver aux administrateurs
["employee"] -> Réserver aux employés
*/
