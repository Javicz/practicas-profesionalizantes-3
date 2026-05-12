class Router {
    constructor(middleware) {
        this.routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
        this.middleware = middleware;
    }

    register(method, path, handler) {
        this.routes[method][path] = handler;
    }

    get(path, handler) { this.register('GET', path, handler); }
    post(path, handler) { this.register('POST', path, handler); }
    put(path, handler) { this.register('PUT', path, handler); }
    delete(path, handler) { this.register('DELETE', path, handler); }

    route(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname;
        const method = req.method;

        this.middleware.check(req, res, () => {
            const handler = this.routes[method]?.[path];
            if (handler) {
                handler(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
            }
        });
    }
}

module.exports = { Router };