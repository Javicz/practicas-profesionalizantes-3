import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

var dbInstance = null;

export function connectDB(path) {
    if (dbInstance) {
        return dbInstance;
    }
    
    var dbPath = resolve(path);
    try {
        dbInstance = new DatabaseSync(dbPath);
        console.log('✅ Conectado a BD:', dbPath);
        return dbInstance;
    } catch (err) {
        throw new Error('Error al conectar a la base de datos: ' + err.message);
    }
}

export function getDB() {
    if (!dbInstance) {
        throw new Error('Base de datos no inicializada');
    }
    return dbInstance;
}