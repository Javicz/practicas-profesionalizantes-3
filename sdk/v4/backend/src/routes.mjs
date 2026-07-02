import {
    loginHandler,
    logoutHandler,
    registerHandler,
    createProtectedHandler,
    listUsersHandler,
    listGroupsHandler,
    createGroupHandler
} from './handlers.mjs';

export function setupRoutes(router) {
    // ============ RUTAS PÚBLICAS ============
    router.set('/login', loginHandler());
    router.set('/logout', logoutHandler());
    router.set('/register', registerHandler());
    router.set('/api/users', listUsersHandler());
    router.set('/api/groups', listGroupsHandler());
    router.set('/api/admin/group/create', createGroupHandler());

    // ============ ENDPOINTS PROTEGIDOS ============
    var protectedEndpoints = ['/print', '/log', '/help', '/sayHello', '/sayBye'];
    for (var i = 0; i < protectedEndpoints.length; i++) {
        router.set(protectedEndpoints[i], createProtectedHandler(protectedEndpoints[i]));
    }
}