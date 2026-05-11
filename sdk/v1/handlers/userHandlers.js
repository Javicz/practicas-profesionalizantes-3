const url = require('url');

class UserHandlers {
    constructor(userDb) {
        this.userDb = userDb;
    }

    // Servir el formulario HTML (GET /)
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

    // Registrar usuario vía POST
    registerUser(req, res) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            // Los datos POST vienen como application/x-www-form-urlencoded
            const params = new URLSearchParams(body);
            const username = params.get('username');
            const password = params.get('password');

            if (!username || !password) {
                res.writeHead(400);
                res.end('Faltan username o password');
                return;
            }

            this.userDb.insertUser(username, password, (err, userId) => {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        res.writeHead(409);
                        res.end('El usuario ya existe');
                    } else {
                        res.writeHead(500);
                        res.end('Error interno en BD');
                    }
                    return;
                }
                res.writeHead(201, { 'Content-Type': 'text/html' });
                res.end(`<h2>Usuario ${username} creado con ID ${userId}</h2>`);
            });
        });
    }

    showMessage(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Mensaje recibido en el servidor correctamente');
    }
}

module.exports = { UserHandlers };