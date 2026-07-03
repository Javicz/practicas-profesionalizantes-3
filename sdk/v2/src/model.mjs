import { getQuery, runQuery, allQuery } from './database.mjs';
import { hashSHA256 } from './auth.mjs';

// ============ USUARIOS ============
export function createUser(db, username, password) {
    var hashedPassword;
    hashedPassword = hashSHA256(password);
    return runQuery(db,
        'INSERT INTO user (username, password_hash) VALUES (?, ?)',
        [username, hashedPassword]
    ).then(function(result) {
        return { id: result.lastID, username: username };
    });
}

export function getUserByUsername(db, username) {
    return getQuery(db, 'SELECT id, username, password_hash FROM user WHERE username = ?', [username]);
}

export function getAllUsers(db) {
    return allQuery(db, 'SELECT id, username, created_at FROM user ORDER BY id');
}

export function deleteUser(db, userId) {
    return runQuery(db, 'DELETE FROM user WHERE id = ?', [userId]);
}

// ============ GRUPOS ============
export function createGroup(db, name) {
    return runQuery(db,
        'INSERT INTO `group` (name) VALUES (?)',
        [name]
    ).then(function(result) {
        return { id: result.lastID, name: name };
    });
}

export function getGroupByName(db, name) {
    return getQuery(db, 'SELECT id, name FROM `group` WHERE name = ?', [name]);
}

export function getAllGroups(db) {
    return allQuery(db, 'SELECT id, name, created_at FROM `group` ORDER BY id');
}

export function deleteGroup(db, groupId) {
    return runQuery(db, 'DELETE FROM `group` WHERE id = ?', [groupId]);
}

export function updateGroup(db, groupId, newName) {
    return runQuery(db, 'UPDATE `group` SET name = ? WHERE id = ?', [newName, groupId]);
}

// ============ ENDPOINTS ============
export function createEndpoint(db, path) {
    return runQuery(db,
        'INSERT OR IGNORE INTO endpoint (path) VALUES (?)',
        [path]
    ).then(function(result) {
        return { id: result.lastID, path: path };
    });
}

export function getEndpointByPath(db, path) {
    return getQuery(db, 'SELECT id, path FROM endpoint WHERE path = ?', [path]);
}

export function getAllEndpoints(db) {
    return allQuery(db, 'SELECT id, path FROM endpoint ORDER BY id');
}

export function deleteEndpoint(db, endpointId) {
    return runQuery(db, 'DELETE FROM endpoint WHERE id = ?', [endpointId]);
}

// ============ MEMBERS (Usuario-Grupo) ============
export function addMember(db, userId, groupId) {
    return runQuery(db,
        'INSERT OR IGNORE INTO members (id_user, id_group) VALUES (?, ?)',
        [userId, groupId]
    );
}

export function removeMember(db, userId, groupId) {
    return runQuery(db,
        'DELETE FROM members WHERE id_user = ? AND id_group = ?',
        [userId, groupId]
    );
}

// ============ ACCESS (Grupo-Endpoint) ============
export function addAccess(db, groupId, endpointId) {
    return runQuery(db,
        'INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES (?, ?)',
        [groupId, endpointId]
    );
}

export function removeAccess(db, groupId, endpointId) {
    return runQuery(db,
        'DELETE FROM access WHERE id_group = ? AND id_endpoint = ?',
        [groupId, endpointId]
    );
}

// ============ PERMISOS ============
export function getUserPermissions(db, username) {
    var sql = `
        SELECT DISTINCT e.path
        FROM access a
        JOIN members m ON a.id_group = m.id_group
        JOIN user u ON m.id_user = u.id
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE u.username = ?
    `;
    return allQuery(db, sql, [username]).then(function(rows) {
        return rows.map(function(row) { return row.path; });
    });
}

export function userHasPermission(db, username, endpointPath) {
    var sql = `
        SELECT COUNT(*) as total
        FROM access a
        JOIN members m ON a.id_group = m.id_group
        JOIN user u ON m.id_user = u.id
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE u.username = ? AND e.path = ?
    `;
    return getQuery(db, sql, [username, endpointPath]).then(function(row) {
        return row.total > 0;
    });
}