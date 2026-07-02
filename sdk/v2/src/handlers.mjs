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

// ============ HANDLER: LISTAR USUARIOS ============
export function listUsersHandler(db) {
    return function(request, response) {
        getAllUsers(db)
            .then(function(users) {
                var html = '<h2>Usuarios</h2>';
                html += '<table border="1"><tr><th>ID</th><th>Username</th><th>Creado</th></tr>';
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
                var html = '<h2>Grupos</h2>';
                html += '<table border="1"><tr><th>ID</th><th>Nombre</th><th>Creado</th></tr>';
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
                var html = '<h2>Endpoints</h2>';
                html += '<table border="1"><tr><th>ID</th><th>Path</th></tr>';
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
        var body, params, name;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            name = params.get('name');
            
            if (!name) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, error: 'Nombre del grupo requerido' }));
                return;
            }
            
            createGroup(db, name)
                .then(function(group) {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, data: group }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: ELIMINAR GRUPO ============
export function deleteGroupHandler(db) {
    return function(request, response) {
        var body, params, id;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            id = parseInt(params.get('id'));
            
            deleteGroup(db, id)
                .then(function() {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: 'Grupo eliminado' }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: ACTUALIZAR GRUPO ============
export function updateGroupHandler(db) {
    return function(request, response) {
        var body, params, id, name;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            id = parseInt(params.get('id'));
            name = params.get('name');
            
            if (!name) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, error: 'Nombre requerido' }));
                return;
            }
            
            updateGroup(db, id, name)
                .then(function() {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: 'Grupo actualizado' }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: ASIGNAR USUARIO A GRUPO ============
export function assignUserToGroupHandler(db) {
    return function(request, response) {
        var body, params, userId, groupId;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            userId = parseInt(params.get('user_id'));
            groupId = parseInt(params.get('group_id'));
            
            addMember(db, userId, groupId)
                .then(function() {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: 'Usuario asignado al grupo' }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: CREAR ENDPOINT ============
export function createEndpointHandler(db) {
    return function(request, response) {
        var body, params, path;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            path = params.get('path');
            
            if (!path) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, error: 'Path requerido' }));
                return;
            }
            
            createEndpoint(db, path)
                .then(function(endpoint) {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, data: endpoint }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: ELIMINAR ENDPOINT ============
export function deleteEndpointHandler(db) {
    return function(request, response) {
        var body, params, endpointId;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            endpointId = parseInt(params.get('endpoint_id'));
            
            deleteEndpoint(db, endpointId)
                .then(function() {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: 'Endpoint eliminado' }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: ASIGNAR PERMISO ============
export function assignPermissionHandler(db) {
    return function(request, response) {
        var body, params, groupId, endpointId;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            groupId = parseInt(params.get('group_id'));
            endpointId = parseInt(params.get('endpoint_id'));
            
            addAccess(db, groupId, endpointId)
                .then(function() {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: 'Permiso asignado' }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: QUITAR PERMISO ============
export function removePermissionHandler(db) {
    return function(request, response) {
        var body, params, groupId, endpointId;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            groupId = parseInt(params.get('group_id'));
            endpointId = parseInt(params.get('endpoint_id'));
            
            removeAccess(db, groupId, endpointId)
                .then(function() {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: 'Permiso removido' }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
                });
        });
    };
}

// ============ HANDLER: VER PERMISOS DE USUARIO ============
export function getUserPermissionsHandler(db) {
    return function(request, response) {
        var url, username;
        
        url = new URL(request.url, 'http://localhost');
        username = url.searchParams.get('username');
        
        if (!username) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, error: 'Username requerido' }));
            return;
        }
        
        getUserPermissions(db, username)
            .then(function(permissions) {
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    success: true, 
                    username: username,
                    permissions: permissions 
                }));
            })
            .catch(function(err) {
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: err.message }));
            });
    };
}

// ============ HANDLER: ELIMINAR USUARIO ============
export function deleteUserHandler(db) {
    return function(request, response) {
        var body, params, userId;
        
        if (request.method !== 'POST') {
            response.writeHead(405);
            response.end('Método no permitido');
            return;
        }

        body = '';
        request.on('data', function(chunk) { body += chunk; });
        
        request.on('end', function() {
            params = new URLSearchParams(body);
            userId = parseInt(params.get('user_id'));
            
            deleteUser(db, userId)
                .then(function() {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: 'Usuario eliminado' }));
                })
                .catch(function(err) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: err.message }));
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