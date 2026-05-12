const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
        this.initTables();
    }

    initTables() {
        this.db.serialize(() => {
            // Tabla user (usuario original de V1, expandida)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS "user" (
                    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                    "username" TEXT NOT NULL UNIQUE,
                    "password" TEXT NOT NULL
                )
            `);

            // Tabla group (nuevo)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS "group" (
                    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                    "name" TEXT NOT NULL UNIQUE
                )
            `);

            // Tabla endpoint (nuevo)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS "endpoint" (
                    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                    "path" TEXT NOT NULL UNIQUE
                )
            `);

            // Tabla members (relación usuario-grupo)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS "members" (
                    "id_user" INTEGER NOT NULL,
                    "id_group" INTEGER NOT NULL,
                    FOREIGN KEY("id_group") REFERENCES "group"("id"),
                    FOREIGN KEY("id_user") REFERENCES "user"("id"),
                    PRIMARY KEY ("id_user", "id_group")
                )
            `);

            // Tabla access (permisos)
            this.db.run(`
                CREATE TABLE IF NOT EXISTS "access" (
                    "id_group" INTEGER NOT NULL,
                    "id_endpoint" INTEGER NOT NULL,
                    FOREIGN KEY("id_endpoint") REFERENCES "endpoint"("id"),
                    FOREIGN KEY("id_group") REFERENCES "group"("id"),
                    PRIMARY KEY ("id_group", "id_endpoint")
                )
            `);

            // Datos iniciales - grupo admin
            this.db.get("SELECT id FROM `group` WHERE name = 'admin'", (err, row) => {
                if (!row && !err) {
                    this.db.run("INSERT INTO `group` (name) VALUES ('admin')");
                    console.log('✅ Grupo "admin" creado');
                }
            });

            // Datos iniciales - endpoint raíz
            this.db.get("SELECT id FROM endpoint WHERE path = '/'", (err, row) => {
                if (!row && !err) {
                    this.db.run("INSERT INTO endpoint (path) VALUES ('/')");
                    console.log('✅ Endpoint "/" creado');
                }
            });

            // Usuario admin por defecto (si no existe)
            this.db.get("SELECT id FROM user WHERE username = 'admin'", (err, row) => {
                if (!row && !err) {
                    this.db.run("INSERT INTO user (username, password) VALUES ('admin', 'admin123')");
                    console.log('✅ Usuario "admin" creado (password: admin123)');
                    
                    // Asignar admin al grupo admin
                    this.db.get("SELECT id FROM `group` WHERE name = 'admin'", (err, groupRow) => {
                        this.db.get("SELECT id FROM user WHERE username = 'admin'", (err, userRow) => {
                            this.db.run("INSERT INTO members (id_user, id_group) VALUES (?, ?)", 
                                [userRow.id, groupRow.id]);
                        });
                    });
                }
            });
        });
        
        console.log('📦 Base de datos inicializada con tablas RBAC');
    }

    // ============ USER METHODS ============
    
    getUserByUsername(username, callback) {
        this.db.get("SELECT * FROM user WHERE username = ?", [username], callback);
    }

    getUserById(id, callback) {
        this.db.get("SELECT * FROM user WHERE id = ?", [id], callback);
    }

    createUser(username, password, callback) {
        this.db.run("INSERT INTO user (username, password) VALUES (?, ?)", 
            [username, password], callback);
    }

    updateUser(id, username, password, callback) {
        this.db.run("UPDATE user SET username = ?, password = ? WHERE id = ?", 
            [username, password, id], callback);
    }

    deleteUser(userId, callback) {
        this.db.serialize(() => {
            this.db.run("DELETE FROM members WHERE id_user = ?", [userId], (err) => {
                if (err) return callback(err);
                this.db.run("DELETE FROM user WHERE id = ?", [userId], callback);
            });
        });
    }

    getAllUsers(callback) {
        this.db.all("SELECT id, username FROM user", callback);
    }

    // ============ GROUP METHODS ============
    
    getGroupById(id, callback) {
        this.db.get("SELECT * FROM `group` WHERE id = ?", [id], callback);
    }

    getGroupByName(name, callback) {
        this.db.get("SELECT * FROM `group` WHERE name = ?", [name], callback);
    }

    createGroup(name, callback) {
        this.db.run("INSERT INTO `group` (name) VALUES (?)", [name], callback);
    }

    updateGroup(id, name, callback) {
        this.db.run("UPDATE `group` SET name = ? WHERE id = ?", [name, id], callback);
    }

    deleteGroup(groupId, callback) {
        this.db.serialize(() => {
            this.db.run("DELETE FROM members WHERE id_group = ?", [groupId], (err) => {
                if (err) return callback(err);
                this.db.run("DELETE FROM access WHERE id_group = ?", [groupId], (err) => {
                    if (err) return callback(err);
                    this.db.run("DELETE FROM `group` WHERE id = ?", [groupId], callback);
                });
            });
        });
    }

    getAllGroups(callback) {
        this.db.all("SELECT * FROM `group`", callback);
    }

    // ============ MEMBER METHODS ============
    
    addMember(userId, groupId, callback) {
        this.db.run("INSERT OR IGNORE INTO members (id_user, id_group) VALUES (?, ?)", 
            [userId, groupId], callback);
    }

    removeMember(userId, groupId, callback) {
        this.db.run("DELETE FROM members WHERE id_user = ? AND id_group = ?", 
            [userId, groupId], callback);
    }

    getUserGroups(userId, callback) {
        this.db.all(`
            SELECT g.* FROM "group" g
            JOIN members m ON m.id_group = g.id
            WHERE m.id_user = ?
        `, [userId], callback);
    }

    getGroupMembers(groupId, callback) {
        this.db.all(`
            SELECT u.id, u.username FROM user u
            JOIN members m ON m.id_user = u.id
            WHERE m.id_group = ?
        `, [groupId], callback);
    }

    // ============ ENDPOINT METHODS ============
    
    getEndpointByPath(path, callback) {
        this.db.get("SELECT * FROM endpoint WHERE path = ?", [path], callback);
    }

    createEndpoint(path, callback) {
        this.db.run("INSERT OR IGNORE INTO endpoint (path) VALUES (?)", [path], callback);
    }

    // ============ ACCESS METHODS ============
    
    grantAccess(groupId, endpointPath, callback) {
        this.db.get("SELECT id FROM endpoint WHERE path = ?", [endpointPath], (err, row) => {
            if (err) return callback(err);
            
            if (row) {
                this.db.run("INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES (?, ?)", 
                    [groupId, row.id], callback);
            } else {
                this.db.run("INSERT INTO endpoint (path) VALUES (?)", [endpointPath], function(err) {
                    if (err) return callback(err);
                    this.db.run("INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES (?, ?)", 
                        [groupId, this.lastID], callback);
                });
            }
        });
    }

    revokeAccess(groupId, endpointPath, callback) {
        this.db.get("SELECT id FROM endpoint WHERE path = ?", [endpointPath], (err, row) => {
            if (err || !row) return callback(err);
            this.db.run("DELETE FROM access WHERE id_group = ? AND id_endpoint = ?", 
                [groupId, row.id], callback);
        });
    }

    checkPermission(username, path, callback) {
        const sql = `
            SELECT COUNT(*) as has_permission
            FROM user u
            JOIN members m ON m.id_user = u.id
            JOIN access a ON a.id_group = m.id_group
            JOIN endpoint e ON e.id = a.id_endpoint
            WHERE u.username = ? AND e.path = ?
        `;
        this.db.get(sql, [username, path], (err, row) => {
            if (err) return callback(err, false);
            callback(null, row.has_permission > 0);
        });
    }

    getGroupPermissions(groupId, callback) {
        this.db.all(`
            SELECT e.path FROM endpoint e
            JOIN access a ON a.id_endpoint = e.id
            WHERE a.id_group = ?
        `, [groupId], callback);
    }

    // ============ UTILITY ============
    
    close() {
        this.db.close();
    }
}

module.exports = { Database };