const http = require('http');
const { loadConfig } = require('./config');
const { UserDatabase } = require('./db/database');
const { UserHandlers } = require('./handlers/userHandlers');
const { Router } = require('./router');

function main() {
    const config = loadConfig();
    const { ip, port, default_path } = config.server;

    const userDb = new UserDatabase(config.database.path);

    const userHandlers = new UserHandlers(userDb);

    const router = new Router();

    router.get('/', (req, res) => {
        userHandlers.serveForm(req, res, default_path);
    });

    router.post('/register', (req, res) => {
        userHandlers.registerUser(req, res);
    });

    router.get('/showMessage', (req, res) => {
        userHandlers.showMessage(req, res);
    });

    const server = http.createServer((req, res) => {
        router.route(req, res);
    });

    server.listen(port, ip, () => {
        console.log(`Servidor corriendo en http://${ip}:${port}`);
    });


    process.on('SIGINT', () => {
        userDb.close();
        server.close();
        console.log('\nServidor cerrado');
        process.exit();
    });
}

main();