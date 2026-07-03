import { connectDB } from './src/database.mjs';
import { hashSHA256 } from './src/auth.mjs';

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

    console.log('✅ Tablas creadas correctamente');

    // ========== ENDPOINTS ==========
    var endpoints = ['/print', '/log', '/help', '/sayHello', '/sayBye'];
    for (var i = 0; i < endpoints.length; i++) {
        var stmt = db.prepare('INSERT OR IGNORE INTO endpoint (path) VALUES (?)');
        stmt.run(endpoints[i]);
    }
    console.log('✅ 5 endpoints creados');

    // ========== GRUPO G ==========
    var groupStmt = db.prepare('INSERT OR IGNORE INTO \`group\` (id, name) VALUES (?, ?)');
    groupStmt.run(1, 'G');
    console.log('✅ Grupo "G" creado (id: 1)');

    // ========== PERMISOS ==========
    var allowedEndpoints = ['/print', '/log', '/help'];
    for (var j = 0; j < allowedEndpoints.length; j++) {
        var endpoint = db.prepare('SELECT id FROM endpoint WHERE path = ?').get(allowedEndpoints[j]);
        if (endpoint) {
            var accessStmt = db.prepare('INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES (?, ?)');
            accessStmt.run(1, endpoint.id);
            console.log('  ✅ Permiso asignado: ' + allowedEndpoints[j]);
        }
    }

    // ========== USUARIO X ==========
    var hashedPassword = hashSHA256('123456');
    var userStmt = db.prepare('INSERT OR IGNORE INTO user (id, username, password_hash) VALUES (?, ?, ?)');
    userStmt.run(1, 'usuarioX', hashedPassword);
    console.log('✅ Usuario "usuarioX" creado (contraseña: 123456)');

    // ========== ASIGNAR USUARIO X AL GRUPO G ==========
    var memberStmt = db.prepare('INSERT OR IGNORE INTO members (id_user, id_group) VALUES (?, ?)');
    memberStmt.run(1, 1);
    console.log('✅ Usuario X asignado al grupo G');

    // ========== USUARIOS ADICIONALES ==========
    var users = [
        ['admin', 'admin123'],
        ['testuser', 'test123'],
        ['demo', 'demo123']
    ];
    
    for (var k = 0; k < users.length; k++) {
        var hpass = hashSHA256(users[k][1]);
        var stmt2 = db.prepare('INSERT OR IGNORE INTO user (username, password_hash) VALUES (?, ?)');
        stmt2.run(users[k][0], hpass);
        console.log('  👤 Usuario creado: ' + users[k][0]);
    }

    console.log('\n📋 RESUMEN:');
    console.log('  👤 Usuario X: usuarioX / 123456');
    console.log('  ✅ Permisos: /print, /log, /help');
    console.log('  ❌ Sin permisos: /sayHello, /sayBye');
    console.log('  📊 Total usuarios: 4');
    console.log('  📊 Total grupos: 1');
    console.log('  📊 Total endpoints: 5');
    console.log('\n✅ Base de datos inicializada correctamente');

    try {
        db.close();
    } catch (err) {
        console.log('⚠️ Base de datos ya cerrada o con consultas pendientes');
    }
}

initDB();