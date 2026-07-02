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
    getUserPermissionsHandler,
    deleteUserHandler,
    createProtectedHandler
} from './handlers.mjs';

export function setupRoutes(router, config, db) {
    // ============ RUTAS PÚBLICAS ============
    router.set('/', defaultHandler(config));
    router.set('/login', loginHandler(db));
    router.set('/logout', logoutHandler());
    router.set('/register', registerHandler(db));
    router.set('/api/users', listUsersHandler(db));
    router.set('/api/groups', listGroupsHandler(db));
    router.set('/api/endpoints', listEndpointsHandler(db));

    // ============ RUTAS DE GESTIÓN ============
    router.set('/api/admin/group/create', createGroupHandler(db));
    router.set('/api/admin/group/delete', deleteGroupHandler(db));
    router.set('/api/admin/group/update', updateGroupHandler(db));
    
    router.set('/api/admin/user/delete', deleteUserHandler(db));
    router.set('/api/admin/user/assign', assignUserToGroupHandler(db));
    
    router.set('/api/admin/endpoint/create', createEndpointHandler(db));
    router.set('/api/admin/endpoint/delete', deleteEndpointHandler(db));
    
    router.set('/api/admin/permission/assign', assignPermissionHandler(db));
    router.set('/api/admin/permission/remove', removePermissionHandler(db));
    
    router.set('/api/user/permissions', getUserPermissionsHandler(db));
    
    // ============ ENDPOINTS DE PRUEBA ============
    var protectedEndpoints = ['/print', '/log', '/help', '/sayHello', '/sayBye'];
    var handler;
    
    for (var i = 0; i < protectedEndpoints.length; i++) {
        handler = createProtectedHandler(db, protectedEndpoints[i]);
        router.set(protectedEndpoints[i], handler);
    }
}