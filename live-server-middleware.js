const spa = require('connect-history-api-fallback');

module.exports = [
    spa({
        index: '/index.html',
        verbose: true // Garder les logs du fallback
    })
];
