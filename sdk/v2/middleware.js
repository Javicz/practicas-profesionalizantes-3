class AuthMiddleware {
    constructor(db) {
        this.db = db;
        this.publicPaths = ['/', '/login', '/register'];
    }

    getAuthenticatedUser(req) {
        // Por ahora usamos header X-User (en producción usarías session/token)
        return req.headers['x-user'];
    }

    check(req, res, next) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;

        // Rutas públicas no requieren autenticación
        if (this.publicPaths.includes(path)) {
            return next();
        }

        const username = this.getAuthenticatedUser(req);
        
        if (!username) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'UNAUTHORIZED', 
                message: 'Requerido: header X-User con nombre de usuario' 
            }));
            return;
        }

        this.db.checkPermission(username, path, (err, hasPermission) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error interno' }));
                return;
            }
            
            if (!hasPermission) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'FORBIDDEN', 
                    message: `Usuario ${username} no tiene permiso para ${path}` 
                }));
                return;
            }
            
            req.user = username;
            next();
        });
    }
}

module.exports = { AuthMiddleware };