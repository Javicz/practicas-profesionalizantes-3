const http = require('http');
const { loadConfig } = require('./config');
const { Database } = require('./db/database');
const { AuthMiddleware } = require('./middleware');
const { Router } = require('./router');
const { AuthHandler } = require('./handlers/authHandler');
const { UserHandler } = require('./handlers/userHandler');
const { GroupHandler } = require('./handlers/groupHandler');
const { MemberHandler } = require('./handlers/memberHandler');
const { AccessHandler } = require('./handlers/accessHandler');

function main() {
    const config = loadConfig();
    const { ip, port, default_path } = config.server;

    const db = new Database(config.database.path);
    const authMiddleware = new AuthMiddleware(db);
    const router = new Router(authMiddleware);
    
    const authHandler = new AuthHandler(db);
    const userHandler = new UserHandler(db);
    const groupHandler = new GroupHandler(db);
    const memberHandler = new MemberHandler(db);
    const accessHandler = new AccessHandler(db);

    // Rutas públicas
    router.get('/', (req, res) => authHandler.serveForm(req, res, default_path));
    router.post('/login', (req, res) => authHandler.login(req, res));
    router.post('/register', (req, res) => authHandler.register(req, res));
    router.get('/showMessage', (req, res) => authHandler.showMessage(req, res));

    // Rutas protegidas (requieren autenticación)
    router.get('/user', (req, res) => userHandler.getUser(req, res));
    router.post('/user', (req, res) => userHandler.createUser(req, res));
    router.put('/user', (req, res) => userHandler.updateUser(req, res));
    router.delete('/user', (req, res) => userHandler.deleteUser(req, res));

    router.get('/group', (req, res) => groupHandler.getGroup(req, res));
    router.post('/group', (req, res) => groupHandler.createGroup(req, res));
    router.put('/group', (req, res) => groupHandler.updateGroup(req, res));
    router.delete('/group', (req, res) => groupHandler.deleteGroup(req, res));

    router.post('/member', (req, res) => memberHandler.addMember(req, res));
    router.delete('/member', (req, res) => memberHandler.removeMember(req, res));
    router.get('/member', (req, res) => memberHandler.getUserGroups(req, res));

    router.post('/access', (req, res) => accessHandler.grantAccess(req, res));
    router.delete('/access', (req, res) => accessHandler.revokeAccess(req, res));
    router.get('/access', (req, res) => accessHandler.getGroupPermissions(req, res));

    const server = http.createServer((req, res) => {
        router.route(req, res);
    });

    server.listen(port, ip, () => {
        console.log(`\n🚀 Servidor RBAC corriendo en http://${ip}:${port}`);
        console.log('\n📌 Credenciales por defecto:');
        console.log('   Usuario: admin');
        console.log('   Password: admin123');
        console.log('\n📌 Probar API protegida:');
        console.log('   curl -H "X-User: admin" http://127.0.0.1:3000/user');
    });

    process.on('SIGINT', () => {
        db.close();
        server.close();
        console.log('\n👋 Servidor cerrado');
        process.exit();
    });
}

main();