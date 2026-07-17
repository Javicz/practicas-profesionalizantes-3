import { connectDB } from './src/database.mjs';
import { hashSHA256 } from './src/auth.mjs';
import { 
    createEndpoint, 
    createGroup, 
    createUser, 
    addMember, 
    addAccess 
} from './src/model.mjs';

var db = connectDB('./data/db.sqlite3');

function initDB() {
    console.log('🔄 Inicializando base de datos...');

    // ========== CREAR TABLAS ==========
    db.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS \`group\` (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS endpoint (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE NOT NULL
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS members (
            id_user INTEGER,
            id_group INTEGER,
            FOREIGN KEY (id_user) REFERENCES user(id) ON DELETE CASCADE,
            FOREIGN KEY (id_group) REFERENCES \`group\`(id) ON DELETE CASCADE,
            PRIMARY KEY (id_user, id_group)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS access (
            id_group INTEGER,
            id_endpoint INTEGER,
            FOREIGN KEY (id_group) REFERENCES \`group\`(id) ON DELETE CASCADE,
            FOREIGN KEY (id_endpoint) REFERENCES endpoint(id) ON DELETE CASCADE,
            PRIMARY KEY (id_group, id_endpoint)
        )
    `);

    console.log('✅ Tablas creadas');

    // ========== INSERTAR ENDPOINTS ==========
    var endpoints = ['/print', '/log', '/help', '/sayHello', '/sayBye'];
    var promises = endpoints.map(function(path) {
        return createEndpoint(db, path);
    });

    Promise.all(promises)
        .then(function() {
            console.log('✅ 5 endpoints creados');
            return createGroup(db, 'G');
        })
        .then(function(group) {
            console.log('✅ Grupo "G" creado (id: ' + group.id + ')');
            return group;
        })
        .then(function(group) {
            var allowedEndpoints = ['/print', '/log', '/help'];
            var accessPromises = allowedEndpoints.map(function(path) {
                return new Promise(function(resolve, reject) {
                    db.get('SELECT id FROM endpoint WHERE path = ?', [path], function(err, row) {
                        if (err) {
                            reject(err);
                        } else if (row) {
                            addAccess(db, group.id, row.id).then(resolve).catch(reject);
                        } else {
                            reject(new Error('Endpoint no encontrado: ' + path));
                        }
                    });
                });
            });
            return Promise.all(accessPromises);
        })
        .then(function() {
            console.log('✅ Permisos asignados: /print, /log, /help');
            console.log('❌ Sin permisos: /sayHello, /sayBye');
            return createUser(db, 'usuarioX', '123456');
        })
        .then(function(user) {
            console.log('✅ Usuario "usuarioX" creado (contraseña: 123456)');
            return new Promise(function(resolve, reject) {
                db.get('SELECT id FROM `group` WHERE name = ?', ['G'], function(err, row) {
                    if (err) {
                        reject(err);
                    } else if (row) {
                        addMember(db, user.id, row.id).then(resolve).catch(reject);
                    } else {
                        reject(new Error('Grupo G no encontrado'));
                    }
                });
            });
        })
        .then(function() {
            console.log('✅ Usuario X asignado al grupo G');
            console.log('\n📋 RESUMEN:');
            console.log('  👤 Usuario X: usuarioX / 123456');
            console.log('  ✅ Permisos: /print, /log, /help');
            console.log('  ❌ Sin permisos: /sayHello, /sayBye');
            console.log('\n✅ Base de datos inicializada correctamente');
            db.close();
        })
        .catch(function(err) {
            console.error('❌ Error:', err);
            db.close();
        });
}

initDB();