import { readFileSync } from 'node:fs';

export function loadConfig() {
    var defaultConfig, config, data;
    
    defaultConfig = {
        server: {
            ip: '127.0.0.1',
            port: 3000,
            default_path: './frontend/default.html'
        },
        database: {
            path: './data/db.sqlite3'
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