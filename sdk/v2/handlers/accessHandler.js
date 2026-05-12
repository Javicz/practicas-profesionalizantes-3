class AccessHandler {
    constructor(db) {
        this.db = db;
    }

    // POST /access
    grantAccess(req, res) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const groupId = params.get('group_id');
            const endpoint = params.get('endpoint');

            this.db.grantAccess(groupId, endpoint, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error al otorgar permiso' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Permiso otorgado' }));
            });
        });
    }

    // DELETE /access?group_id=1&endpoint=/user
    revokeAccess(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const groupId = url.searchParams.get('group_id');
        const endpoint = url.searchParams.get('endpoint');

        this.db.revokeAccess(groupId, endpoint, (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al revocar permiso' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Permiso revocado' }));
        });
    }

    // GET /access?group_id=1
    getGroupPermissions(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const groupId = url.searchParams.get('group_id');

        this.db.getGroupPermissions(groupId, (err, permissions) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener permisos' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(permissions));
        });
    }
}

module.exports = { AccessHandler };