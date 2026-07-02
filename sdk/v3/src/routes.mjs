import {
    defaultHandler,
    loginHandler,
    logoutHandler,
    registerHandler,
    createProtectedHandler
} from './handlers.mjs';

export function setupRoutes(router, config, db) {
    // ============ RUTAS PÚBLICAS ============
    router.set('/', defaultHandler(config));
    router.set('/login', loginHandler(db));
    router.set('/logout', logoutHandler());
    router.set('/register', registerHandler(db));

    // ============ ENDPOINTS DE PRUEBA ============
    var protectedEndpoints = ['/print', '/log', '/help', '/sayHello', '/sayBye'];
    var handler;
    
    for (var i = 0; i < protectedEndpoints.length; i++) {
        handler = createProtectedHandler(db, protectedEndpoints[i]);
        router.set(protectedEndpoints[i], handler);
    }
}