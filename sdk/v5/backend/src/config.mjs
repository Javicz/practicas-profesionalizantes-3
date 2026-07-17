import { readFileSync } from 'node:fs';

export function loadConfig() {
    var defaultConfig, config, data;
    
    defaultConfig = {
        server: {
            ip: '127.0.0.1',
            port: 8080
        },
        database: {
            path: './data/db.sqlite3'
        },
        cors: {
            origin: '*',
            methods: 'GET, POST, OPTIONS',
            headers: 'Content-Type, Authorization, X-User-Id'
        }
    };

    try {
        data = readFileSync('./config.json', 'utf-8');
        config = JSON.parse(data);
        console.log('✅ Configuración cargada correctamente.');
        return config;
    } catch (error) {
        console.error('❌ Error cargando config.json. Usando valores por defecto.');
        return defaultConfig;
    }
}