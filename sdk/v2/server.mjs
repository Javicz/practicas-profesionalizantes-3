import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { connectDB } from './src/database.mjs';
import { loadConfig } from './src/config.mjs';
import { setupRoutes } from './src/routes.mjs';

var config = loadConfig();
var db = connectDB(config.database.path);
var router = new Map();

setupRoutes(router, config, db);

function requestDispatcher(request, response) {
    var url = new URL(request.url, 'http://' + config.server.ip);
    var path = url.pathname;

    if (path === '/' || path === '/default.html') {
        try {
            var html = readFileSync(config.server.default_path, 'utf-8');
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(html);
            return;
        } catch (error) {
            response.writeHead(500);
            response.end('Error interno');
            return;
        }
    }

    var handler = router.get(path);
    if (!handler) {
        response.writeHead(404);
        response.end('Recurso no encontrado');
        return;
    }

    handler(request, response);
}

function startServer() {
    console.log('🚀 Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
    console.log('📋 Endpoints públicos: /, /login, /logout, /register, /api/*');
    console.log('🔒 Endpoints protegidos: /print, /log, /help, /sayHello, /sayBye');
    console.log('📝 Contraseñas almacenadas con SHA256 (irreversible)');
}

var server = createServer(requestDispatcher);
server.listen(config.server.port, config.server.ip, startServer);