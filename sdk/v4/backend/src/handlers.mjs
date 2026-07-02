import { getDB } from './database.mjs';
import { authenticate, logout, authorize, validateHeaders, isSessionActive } from './auth.mjs';
import { hashSHA256 } from './auth.mjs';

// ============ HELPERS ============
function sendResponse(response, code, data) {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
}

function sendError(response, code, exception, detail) {
    detail = detail || [];
    sendResponse(response, code, { exception: exception, detail: detail });
}

// ============ HANDLER: LOGIN ============
export function loginHandler() {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendError(response, 405, 'METHOD_NOT_ALLOWED', ['Usa POST']);
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            try {
                var params = JSON.parse(body);
                var username = params.username;
                var password = params.password;

                if (!username || !password) {
                    sendError(response, 400, 'BAD_REQUEST', ['Usuario y contraseña requeridos']);
                    return;
                }

                var db = getDB();
                var result = authenticate(db, username, password);

                if (result.success) {
                    sendResponse(response, 200, {
                        success: true,
                        userId: result.userId,
                        username: result.username,
                        message: 'Login exitoso'
                    });
                } else {
                    sendError(response, result.code || 401, 'UNAUTHORIZED', [result.message]);
                }
            } catch (err) {
                sendError(response, 400, 'BAD_REQUEST', ['JSON inválido']);
            }
        });
    };
}

// ============ HANDLER: LOGOUT ============
export function logoutHandler() {
    return function(request, response) {
        if (request.method !== 'POST') {
            sendError(response, 405, 'METHOD_NOT_ALLOWED', ['Usa POST']);
            return;
        }

        var validation = validateHeaders(request.headers);
        if (!validation.valid) {
            sendError(response, validation.code, 'UNAUTHORIZED', [validation.message]);
            return;
        }

        var result = logout(validation.userId);
        if (result.success) {
            sendResponse(response, 200, { success: true, message: result.message });
        } else {
            sendError(response, 400, 'BAD_REQUEST', [result.message]);
        }
    };
}

// ============ HANDLER: REGISTRO ============
export function registerHandler() {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendError(response, 405, 'METHOD_NOT_ALLOWED', ['Usa POST']);
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            try {
                var params = JSON.parse(body);
                var username = params.username;
                var password = params.password;

                if (!username || !password) {
                    sendError(response, 400, 'BAD_REQUEST', ['Usuario y contraseña requeridos']);
                    return;
                }

                var db = getDB();
                var hashedPassword = hashSHA256(password);
                var sql = 'INSERT INTO user (username, password_hash) VALUES (?, ?)';
                var stmt = db.prepare(sql);
                var result = stmt.run(username, hashedPassword);

                sendResponse(response, 200, {
                    success: true,
                    user: { id: result.lastInsertRowid, username: username },
                    message: 'Usuario creado con SHA256'
                });
            } catch (err) {
                sendError(response, 500, 'INTERNAL_ERROR', [err.message]);
            }
        });
    };
}

// ============ HANDLER: PROTEGIDOS ============
export function createProtectedHandler(endpointPath) {
    return function(request, response) {
        if (request.method !== 'POST' && request.method !== 'GET') {
            sendError(response, 405, 'METHOD_NOT_ALLOWED', ['Usa POST o GET']);
            return;
        }

        var validation = validateHeaders(request.headers);
        if (!validation.valid) {
            sendError(response, validation.code, 'UNAUTHORIZED', [validation.message]);
            return;
        }

        var db = getDB();
        var userId = validation.userId;

        if (!isSessionActive(userId)) {
            sendError(response, 401, 'UNAUTHORIZED', ['Sesión no activa']);
            return;
        }

        var hasPermission = authorize(db, userId, endpointPath);
        if (!hasPermission) {
            sendError(response, 403, 'FORBIDDEN', ['No tienes permisos para ' + endpointPath]);
            return;
        }

        sendResponse(response, 200, {
            success: true,
            message: 'Endpoint ' + endpointPath + ' ejecutado',
            endpoint: endpointPath,
            userId: userId,
            timestamp: new Date().toISOString()
        });
    };
}

// ============ HANDLER: LISTAR USUARIOS ============
export function listUsersHandler() {
    return function(request, response) {
        if (request.method !== 'GET') {
            sendError(response, 405, 'METHOD_NOT_ALLOWED', ['Usa GET']);
            return;
        }

        var db = getDB();
        var sql = 'SELECT id, username, created_at FROM user ORDER BY id';
        var stmt = db.prepare(sql);
        var users = stmt.all();

        sendResponse(response, 200, { success: true, data: users });
    };
}

// ============ HANDLER: LISTAR GRUPOS ============
export function listGroupsHandler() {
    return function(request, response) {
        if (request.method !== 'GET') {
            sendError(response, 405, 'METHOD_NOT_ALLOWED', ['Usa GET']);
            return;
        }

        var db = getDB();
        var sql = 'SELECT id, name, created_at FROM `group` ORDER BY id';
        var stmt = db.prepare(sql);
        var groups = stmt.all();

        sendResponse(response, 200, { success: true, data: groups });
    };
}

// ============ HANDLER: CREAR GRUPO ============
export function createGroupHandler() {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendError(response, 405, 'METHOD_NOT_ALLOWED', ['Usa POST']);
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            try {
                var params = JSON.parse(body);
                var name = params.name;

                if (!name) {
                    sendError(response, 400, 'BAD_REQUEST', ['Nombre del grupo requerido']);
                    return;
                }

                var db = getDB();
                var sql = 'INSERT INTO `group` (name) VALUES (?)';
                var stmt = db.prepare(sql);
                var result = stmt.run(name);

                sendResponse(response, 200, {
                    success: true,
                    data: { id: result.lastInsertRowid, name: name }
                });
            } catch (err) {
                sendError(response, 500, 'INTERNAL_ERROR', [err.message]);
            }
        });
    };
}