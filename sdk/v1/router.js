class Router {
    constructor() {
        this.routes = {
            GET: {},
            POST: {}
        };
    }

    get(path, handler) {
        this.routes.GET[path] = handler;
    }

    post(path, handler) {
        this.routes.POST[path] = handler;
    }

    route(req, res) {
        const method = req.method;
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const pathname = urlObj.pathname;

        const handler = this.routes[method]?.[pathname];
        if (handler) {
            handler(req, res);
        } else {
            res.writeHead(404);
            res.end('Ruta no encontrada');
        }
    }
}

module.exports = { Router };