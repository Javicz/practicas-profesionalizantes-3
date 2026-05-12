class MemberHandler {
    constructor(db) {
        this.db = db;
    }

    // POST /member
    addMember(req, res) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const userId = params.get('user_id');
            const groupId = params.get('group_id');

            this.db.addMember(userId, groupId, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error al asignar' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Usuario asignado al grupo' }));
            });
        });
    }

    // DELETE /member?user_id=1&group_id=2
    removeMember(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const userId = url.searchParams.get('user_id');
        const groupId = url.searchParams.get('group_id');

        this.db.removeMember(userId, groupId, (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al remover' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Usuario removido del grupo' }));
        });
    }

    // GET /member?user_id=1
    getUserGroups(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const userId = url.searchParams.get('user_id');

        this.db.getUserGroups(userId, (err, groups) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al obtener grupos' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(groups));
        });
    }
}

module.exports = { MemberHandler };