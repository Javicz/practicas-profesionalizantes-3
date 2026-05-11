const sqlite3 = require('sqlite3').verbose();

class UserDatabase {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
        this.initTable();
    }

    initTable() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);
    }

    insertUser(username, password, callback) {
        const stmt = this.db.prepare(
            'INSERT INTO users (username, password) VALUES (?, ?)'
        );
        stmt.run(username, password, function(err) {
            callback(err, this?.lastID);
        });
        stmt.finalize();
    }

    close() {
        this.db.close();
    }
}

module.exports = { UserDatabase };