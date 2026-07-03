import {
    defaultHandler,
    loginHandler,
    logoutHandler,
    registerHandler,
    listUsersHandler,
    listGroupsHandler,
    listEndpointsHandler,
    createGroupHandler,
    deleteGroupHandler,
    updateGroupHandler,
    assignUserToGroupHandler,
    createEndpointHandler,
    deleteEndpointHandler,
    assignPermissionHandler,
    removePermissionHandler,
    deleteUserHandler,
    createProtectedHandler
} from './handlers.mjs';

export function setupRoutes(router, config, db) {
    // Rutas públicas
    router.set('/', defaultHandler(config));
    router.set('/login', loginHandler(db));
    router.set('/logout', logoutHandler());
    router.set('/register', registerHandler(db));
    router.set('/api/users', listUsersHandler(db));
    router.set('/api/groups', listGroupsHandler(db));
    router.set('/api/endpoints', listEndpointsHandler(db));

    // Gestión
    router.set('/api/admin/group/create', createGroupHandler(db));
    router.set('/api/admin/group/delete', deleteGroupHandler(db));
    router.set('/api/admin/group/update', updateGroupHandler(db));
    router.set('/api/admin/user/delete', deleteUserHandler(db));
    router.set('/api/admin/user/assign', assignUserToGroupHandler(db));
    router.set('/api/admin/endpoint/create', createEndpointHandler(db));
    router.set('/api/admin/endpoint/delete', deleteEndpointHandler(db));
    router.set('/api/admin/permission/assign', assignPermissionHandler(db));
    router.set('/api/admin/permission/remove', removePermissionHandler(db));

    // Endpoints protegidos
    var protectedEndpoints = ['/print', '/log', '/help', '/sayHello', '/sayBye'];
    for (var i = 0; i < protectedEndpoints.length; i++) {
        router.set(protectedEndpoints[i], createProtectedHandler(db, protectedEndpoints[i]));
    }
}