import sqlite3 from 'sqlite3';
import { resolve } from 'node:path';

// ============ SOLO PROVEE CONEXIÓN ============
export function connectDB(path) {
    var dbPath, db;
    
    dbPath = resolve(path);
    db = new sqlite3.Database(dbPath, function(err) {
        if (err) {
            throw new Error('Error al conectar a la base de datos: ' + err.message);
        }
    });
    return db;
}

// ============ HELPERS PARA CONSULTAS ============
export function runQuery(db, sql, params) {
    params = params || [];
    return new Promise(function(resolve, reject) {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

export function getQuery(db, sql, params) {
    params = params || [];
    return new Promise(function(resolve, reject) {
        db.get(sql, params, function(err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

export function allQuery(db, sql, params) {
    params = params || [];
    return new Promise(function(resolve, reject) {
        db.all(sql, params, function(err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}