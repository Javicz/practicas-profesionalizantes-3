class GroupHandler {
    constructor(db) {
        this.db = db;
    }

    // GET /group?id=1
    getGroup(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get('id');
        
        if (id) {
            this.db.getGroupById(parseInt(id), (err, group) => {
                if (err || !group) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Grupo no encontrado' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(group));
            });
        } else {
            this.db.getAllGroups((err, groups) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(groups));
            });
        }
    }

    // POST /group
    createGroup(req, res) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const name = params.get('name');

            this.db.createGroup(name, (err) => {
                if (err && err.message.includes('UNIQUE')) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Grupo ya existe' }));
                    return;
                }
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error interno' }));
                    return;
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Grupo creado' }));
            });
        });
    }

    // PUT /group
    updateGroup(req, res) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const id = params.get('id');
            const name = params.get('name');

            this.db.updateGroup(id, name, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error al actualizar' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Grupo actualizado' }));
            });
        });
    }

    // DELETE /group?id=1
    deleteGroup(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get('id');

        this.db.deleteGroup(id, (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al eliminar' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Grupo eliminado' }));
        });
    }
}

module.exports = { GroupHandler };