const spa = require('connect-history-api-fallback');
const proxy = require('http-proxy-middleware');

module.exports = [
    // Proxy pour rediriger les requêtes API vers le backend Symfony
    function(req, res, next) {
        // Si la requête commence par /api, on la redirige vers le backend
        if (req.url.startsWith('/api')) {
            // Modification de l'URL pour pointer vers le backend Symfony
            req.url = 'http://127.0.0.1:8000' + req.url;
            console.log('Redirection API vers:', req.url);
            
            // Autoriser toutes les méthodes HTTP
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            // Pour les requêtes OPTIONS (preflight CORS)
            if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
                return;
            }
        }
        next();
    },
    
    // SPA fallback pour les routes frontend
    spa({
        index: '/index.html',
        verbose: true, // Garder les logs du fallback
        // Ne pas appliquer le fallback aux requêtes API
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
        disableDotRule: true
    })
];
