class AuthHandler {
    constructor(db) {
        this.db = db;
    }

    serveForm(req, res, defaultPath) {
        const fs = require('fs');
        fs.readFile(defaultPath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error cargando formulario');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }

    login(req, res) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const username = params.get('username');
            const password = params.get('password');

            this.db.getUserByUsername(username, (err, user) => {
                if (err || !user || user.password !== password) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        status: false, 
                        result: null,
                        description: 'INVALID_USER_PASS' 
                    }));
                    return;
                }

                // Obtener grupos del usuario
                this.db.getUserGroups(user.id, (err, groups) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: true,
                        result: { 
                            username: user.username, 
                            id: user.id,
                            groups: groups.map(g => g.name)
                        },
                        description: null
                    }));
                });
            });
        });
    }

    register(req, res) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const username = params.get('username');
            const password = params.get('password');

            if (!username || !password) {
                res.writeHead(400);
                res.end('Faltan username o password');
                return;
            }

            this.db.createUser(username, password, (err) => {
                if (err && err.message.includes('UNIQUE')) {
                    res.writeHead(409);
                    res.end('El usuario ya existe');
                    return;
                }
                if (err) {
                    res.writeHead(500);
                    res.end('Error interno en BD');
                    return;
                }
                
                // Asignar grupo por defecto (viewer) - crear si no existe
                this.db.getGroupByName('viewer', (err, group) => {
                    if (!group) {
                        this.db.createGroup('viewer', (err) => {
                            this.db.getGroupByName('viewer', (err, newGroup) => {
                                this.db.getUserByUsername(username, (err, user) => {
                                    this.db.addMember(user.id, newGroup.id, () => {});
                                });
                            });
                        });
                    } else {
                        this.db.getUserByUsername(username, (err, user) => {
                            this.db.addMember(user.id, group.id, () => {});
                        });
                    }
                });
                
                res.writeHead(201, { 'Content-Type': 'text/html' });
                res.end(`<h2>Usuario ${username} creado exitosamente</h2>`);
            });
        });
    }

    showMessage(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Mensaje recibido en el servidor correctamente');
    }
}

module.exports = { AuthHandler };