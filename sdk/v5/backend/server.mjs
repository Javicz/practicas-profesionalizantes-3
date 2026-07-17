import { createServer } from 'node:http';
import { URL } from 'node:url';
import { connectDB } from './src/database.mjs';
import { loadConfig } from './src/config.mjs';
import { setupRoutes } from './src/routes.mjs';

var config = loadConfig();

// Conectar a la base de datos
connectDB(config.database.path);

var router = new Map();
setupRoutes(router);

// ============ CORS ============
function setCorsHeaders(response) {
    response.setHeader('Access-Control-Allow-Origin', config.cors.origin);
    response.setHeader('Access-Control-Allow-Methods', config.cors.methods);
    response.setHeader('Access-Control-Allow-Headers', config.cors.headers);
    response.setHeader('X-API-Version', '1.0');
}

// ============ DESPACHADOR ============
function requestDispatcher(request, response) {
    var url = new URL(request.url, 'http://' + config.server.ip + ':' + config.server.port);
    var path = url.pathname;
    var handler;

    // CORS siempre
    setCorsHeaders(response);

    // Preflight OPTIONS
    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    handler = router.get(path);
    if (!handler) {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ exception: 'NOT_FOUND', detail: ['Recurso no encontrado'] }));
        return;
    }

    handler(request, response);
}

// ============ INICIAR ============
function startServer() {
    console.log('🚀 Backend API en http://' + config.server.ip + ':' + config.server.port);
    console.log('📋 Endpoints:');
    console.log('  POST /login - Iniciar sesión');
    console.log('  POST /logout - Cerrar sesión');
    console.log('  POST /register - Registrar usuario');
    console.log('  GET /api/users - Listar usuarios');
    console.log('  GET /api/groups - Listar grupos');
    console.log('  POST /api/admin/group/create - Crear grupo');
    console.log('  POST /print - Endpoint protegido');
    console.log('  POST /log - Endpoint protegido');
    console.log('  POST /help - Endpoint protegido');
    console.log('  POST /sayHello - Endpoint protegido');
    console.log('  POST /sayBye - Endpoint protegido');
    console.log('🔐 Usuario X tiene permisos para: /print, /log, /help');
    console.log('❌ Sin permisos: /sayHello, /sayBye');
}

var server = createServer(requestDispatcher);
server.listen(config.server.port, config.server.ip, startServer);