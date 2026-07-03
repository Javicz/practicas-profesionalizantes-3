import {
    createUser, getAllUsers, deleteUser,
    createGroup, getAllGroups, deleteGroup, updateGroup,
    createEndpoint, getAllEndpoints, deleteEndpoint,
    addMember, removeMember,
    addAccess, removeAccess
} from './model.mjs';
import { authenticate, logout, isSessionActive, authorize } from './auth.mjs';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

// ============ HELPERS ============
function sendJSON(response, code, data) {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
}

// ============ HANDLER: PÁGINA PRINCIPAL ============
export function defaultHandler(config) {
    return function(request, response) {
        try {
            var html = readFileSync(config.server.default_path, 'utf-8');
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(html);
        } catch (error) {
            response.writeHead(500);
            response.end('Error interno');
        }
    };
}

// ============ HANDLER: LOGIN ============
export function loginHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido. Usa POST.' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var username = params.get('username');
            var password = params.get('password');

            authenticate(db, username, password)
                .then(function(result) {
                    sendJSON(response, result.success ? 200 : 401, result);
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: LOGOUT ============
export function logoutHandler() {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido. Usa POST.' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var username = params.get('username');
            var result = logout(username);
            sendJSON(response, result.success ? 200 : 400, result);
        });
    };
}

// ============ HANDLER: REGISTRO ============
export function registerHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido. Usa POST.' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var username = params.get('username');
            var password = params.get('password');

            if (!username || !password) {
                sendJSON(response, 400, { success: false, error: 'Usuario y contraseña son requeridos' });
                return;
            }

            createUser(db, username, password)
                .then(function(user) {
                    sendJSON(response, 200, { success: true, user: user, message: 'Usuario creado con SHA256' });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, error: err.message });
                });
        });
    };
}

// ============ HANDLER: LISTAR USUARIOS ============
export function listUsersHandler(db) {
    return function(request, response) {
        getAllUsers(db)
            .then(function(users) {
                var html = '<h2>Usuarios</h2><table border="1"><tr><th>ID</th><th>Username</th><th>Creado</th></tr>';
                users.forEach(function(u) {
                    html += '<tr><td>' + u.id + '</td><td>' + u.username + '</td><td>' + u.created_at + '</td></tr>';
                });
                html += '</table>';
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(html);
            })
            .catch(function(err) {
                response.writeHead(500);
                response.end('Error al cargar usuarios.');
            });
    };
}

// ============ HANDLER: LISTAR GRUPOS ============
export function listGroupsHandler(db) {
    return function(request, response) {
        getAllGroups(db)
            .then(function(groups) {
                var html = '<h2>Grupos</h2><table border="1"><tr><th>ID</th><th>Nombre</th><th>Creado</th></tr>';
                groups.forEach(function(g) {
                    html += '<tr><td>' + g.id + '</td><td>' + g.name + '</td><td>' + g.created_at + '</td></tr>';
                });
                html += '</table>';
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(html);
            })
            .catch(function(err) {
                response.writeHead(500);
                response.end('Error al cargar grupos.');
            });
    };
}

// ============ HANDLER: LISTAR ENDPOINTS ============
export function listEndpointsHandler(db) {
    return function(request, response) {
        getAllEndpoints(db)
            .then(function(endpoints) {
                var html = '<h2>Endpoints</h2><table border="1"><tr><th>ID</th><th>Path</th></tr>';
                endpoints.forEach(function(e) {
                    html += '<tr><td>' + e.id + '</td><td>' + e.path + '</td></tr>';
                });
                html += '</table>';
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(html);
            })
            .catch(function(err) {
                response.writeHead(500);
                response.end('Error al cargar endpoints.');
            });
    };
}

// ============ HANDLER: CREAR GRUPO ============
export function createGroupHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var name = params.get('name');
            
            if (!name) {
                sendJSON(response, 400, { success: false, error: 'Nombre del grupo requerido' });
                return;
            }
            
            createGroup(db, name)
                .then(function(group) {
                    sendJSON(response, 200, { success: true, data: group });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: ELIMINAR GRUPO ============
export function deleteGroupHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var id = parseInt(params.get('id'));
            
            if (isNaN(id)) {
                sendJSON(response, 400, { success: false, error: 'ID inválido' });
                return;
            }
            
            deleteGroup(db, id)
                .then(function() {
                    sendJSON(response, 200, { success: true, message: 'Grupo eliminado' });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: ACTUALIZAR GRUPO ============
export function updateGroupHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var id = parseInt(params.get('id'));
            var name = params.get('name');
            
            if (isNaN(id) || !name) {
                sendJSON(response, 400, { success: false, error: 'ID y nombre requeridos' });
                return;
            }
            
            updateGroup(db, id, name)
                .then(function() {
                    sendJSON(response, 200, { success: true, message: 'Grupo actualizado' });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: ASIGNAR USUARIO A GRUPO ============
export function assignUserToGroupHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var userId = parseInt(params.get('user_id'));
            var groupId = parseInt(params.get('group_id'));
            
            if (isNaN(userId) || isNaN(groupId)) {
                sendJSON(response, 400, { success: false, error: 'IDs inválidos' });
                return;
            }
            
            addMember(db, userId, groupId)
                .then(function() {
                    sendJSON(response, 200, { success: true, message: 'Usuario asignado al grupo' });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: CREAR ENDPOINT ============
export function createEndpointHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var path = params.get('path');
            
            if (!path) {
                sendJSON(response, 400, { success: false, error: 'Path requerido' });
                return;
            }
            
            createEndpoint(db, path)
                .then(function(endpoint) {
                    sendJSON(response, 200, { success: true, data: endpoint });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: ELIMINAR ENDPOINT ============
export function deleteEndpointHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var endpointId = parseInt(params.get('endpoint_id'));
            
            if (isNaN(endpointId)) {
                sendJSON(response, 400, { success: false, error: 'ID inválido' });
                return;
            }
            
            deleteEndpoint(db, endpointId)
                .then(function() {
                    sendJSON(response, 200, { success: true, message: 'Endpoint eliminado' });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: ASIGNAR PERMISO ============
export function assignPermissionHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var groupId = parseInt(params.get('group_id'));
            var endpointId = parseInt(params.get('endpoint_id'));
            
            if (isNaN(groupId) || isNaN(endpointId)) {
                sendJSON(response, 400, { success: false, error: 'IDs inválidos' });
                return;
            }
            
            addAccess(db, groupId, endpointId)
                .then(function() {
                    sendJSON(response, 200, { success: true, message: 'Permiso asignado' });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: QUITAR PERMISO ============
export function removePermissionHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var groupId = parseInt(params.get('group_id'));
            var endpointId = parseInt(params.get('endpoint_id'));
            
            if (isNaN(groupId) || isNaN(endpointId)) {
                sendJSON(response, 400, { success: false, error: 'IDs inválidos' });
                return;
            }
            
            removeAccess(db, groupId, endpointId)
                .then(function() {
                    sendJSON(response, 200, { success: true, message: 'Permiso removido' });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: ELIMINAR USUARIO ============
export function deleteUserHandler(db) {
    return function(request, response) {
        var body = '';
        
        if (request.method !== 'POST') {
            sendJSON(response, 405, { error: 'Método no permitido' });
            return;
        }

        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            var params = new URLSearchParams(body);
            var userId = parseInt(params.get('user_id'));
            
            if (isNaN(userId)) {
                sendJSON(response, 400, { success: false, error: 'ID inválido' });
                return;
            }
            
            deleteUser(db, userId)
                .then(function() {
                    sendJSON(response, 200, { success: true, message: 'Usuario eliminado' });
                })
                .catch(function(err) {
                    sendJSON(response, 500, { success: false, message: err.message });
                });
        });
    };
}

// ============ HANDLER: ENDPOINTS PROTEGIDOS ============
export function createProtectedHandler(db, endpointPath) {
    return function(request, response) {
        var url = new URL(request.url, 'http://localhost');
        var username = url.searchParams.get('username');

        if (!username) {
            sendJSON(response, 401, { success: false, message: 'No autenticado. Envía el parámetro username' });
            return;
        }

        if (!isSessionActive(username)) {
            sendJSON(response, 401, { success: false, message: 'Sesión no activa o expirada' });
            return;
        }

        authorize(db, username, endpointPath)
            .then(function(hasPermission) {
                if (!hasPermission) {
                    sendJSON(response, 403, {
                        success: false,
                        message: 'No tienes permisos para acceder a ' + endpointPath,
                        endpoint: endpointPath,
                        user: username
                    });
                    return;
                }

                sendJSON(response, 200, {
                    success: true,
                    message: 'Endpoint ' + endpointPath + ' ejecutado correctamente',
                    endpoint: endpointPath,
                    user: username,
                    timestamp: new Date().toISOString()
                });
            })
            .catch(function(err) {
                sendJSON(response, 500, { success: false, message: err.message });
            });
    };
}