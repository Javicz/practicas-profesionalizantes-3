import {
    createUser, getAllUsers, deleteUser,
    createGroup, getAllGroups, deleteGroup, updateGroup,
    createEndpoint, getAllEndpoints, deleteEndpoint,
    addMember, removeMember,
    addAccess, removeAccess,
    getUserPermissions
} from './model.mjs';
import { authenticate, logout, isSessionActive, authorize } from './auth.mjs';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

// ============ HANDLER: PÁGINA PRINCIPAL ============
export function defaultHandler(config) {
    return function(request, response) {
        var html;
        try {
            html = readFileSync(config.server.default_path, 'utf-8');
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(html);
        } catch (error) {
            response.writeHead(500);
            response.end('Error interno: No se pudo cargar la vista principal.');
        }
    };
}

// ============ HANDLER: LOGIN ============
export function loginHandler(db) {
    return function(request, response) {
        var body, params, username, password;
        
        if (request.method !== 'POST') {
            response.writeHead(405, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            username = params.get('username');
            password = params.get('password');

            authenticate(db, username, password)
                .then(function(result) {
                    response.writeHead(result.success ? 200 : 401, {
                        'Content-Type': 'application/json'
                    });
                    response.end(JSON.stringify(result));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: LOGOUT ============
export function logoutHandler() {
    return function(request, response) {
        var body, params, username, result;
        
        if (request.method !== 'POST') {
            response.writeHead(405, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            username = params.get('username');

            result = logout(username);

            response.writeHead(result.success ? 200 : 400, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify(result));
        });
    };
}

// ============ HANDLER: REGISTRO ============
export function registerHandler(db) {
    return function(request, response) {
        var body, params, username, password;
        
        if (request.method !== 'POST') {
            response.writeHead(405, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            username = params.get('username');
            password = params.get('password');

            if (!username || !password) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({
                    success: false,
                    error: 'Usuario y contraseña son requeridos'
                }));
                return;
            }

            createUser(db, username, password)
                .then(function(user) {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({
                        success: true,
                        user: user,
                        message: 'Usuario creado con contraseña cifrada SHA256'
                    }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({
                        success: false,
                        error: err.message
                    }));
                });
        });
    };
}

// ============ HANDLER: ENDPOINTS PROTEGIDOS ============
export function createProtectedHandler(db, endpointPath) {
    return function(request, response) {
        var url, username;
        
        url = new URL(request.url, 'http://localhost');
        username = url.searchParams.get('username');

        if (!username) {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                success: false,
                message: 'No autenticado. Envía el parámetro username'
            }));
            return;
        }

        if (!isSessionActive(username)) {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                success: false,
                message: 'Sesión no activa o expirada'
            }));
            return;
        }

        authorize(db, username, endpointPath)
            .then(function(hasPermission) {
                if (!hasPermission) {
                    response.writeHead(403, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({
                        success: false,
                        message: 'No tienes permisos para acceder a ' + endpointPath,
                        endpoint: endpointPath,
                        user: username
                    }));
                    return;
                }

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({
                    success: true,
                    message: 'Endpoint ' + endpointPath + ' ejecutado correctamente',
                    endpoint: endpointPath,
                    user: username,
                    timestamp: new Date().toISOString()
                }));
            })
            .catch(function(err) {
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: err.message }));
            });
    };
}