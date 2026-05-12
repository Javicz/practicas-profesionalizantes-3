class UserHandler {
    constructor(db) {
        this.db = db;
    }

    // GET /user?id=1
    getUser(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get('id');
        
        if (id) {
            this.db.getUserById(parseInt(id), (err, user) => {
                if (err || !user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Usuario no encontrado' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ id: user.id, username: user.username }));
            });
        } else {
            this.db.getAllUsers((err, users) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            });
        }
    }

    // POST /user
    createUser(req, res) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const username = params.get('username');
            const password = params.get('password');

            this.db.createUser(username, password, (err) => {
                if (err && err.message.includes('UNIQUE')) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Usuario ya existe' }));
                    return;
                }
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error interno' }));
                    return;
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario creado' }));
            });
        });
    }

    // PUT /user
    updateUser(req, res) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const id = params.get('id');
            const username = params.get('username');
            const password = params.get('password');

            this.db.updateUser(id, username, password, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error al actualizar' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario actualizado' }));
            });
        });
    }

    // DELETE /user?id=1
    deleteUser(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get('id');

        this.db.deleteUser(id, (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al eliminar' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Usuario eliminado' }));
        });
    }
}

module.exports = { UserHandler };