const spa = require('connect-history-api-fallback');

module.exports = {
    port: 8000,
    open: true,
    middleware: [
        spa({
            index: '/index.html',
            verbose: true // Garde ça !
        })
    ]
};
