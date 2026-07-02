import { createHash } from 'node:crypto';
import { getDB } from './database.mjs';

// ============ SHA256 ============
export function hashSHA256(text) {
    return createHash('sha256')
        .update(text)
        .digest('hex');
}

// ============ SESIONES ============
var sessions = new Map();

export function getSession(userId) {
    return sessions.get(userId) || null;
}

export function createSession(userId, username) {
    var session = {
        userId: userId,
        username: username,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    sessions.set(userId, session);
    return session;
}

export function destroySession(userId) {
    sessions.delete(userId);
}

export function isSessionActive(userId) {
    var session = getSession(userId);
    return session && session.status === 'active';
}

// ============ AUTENTICADOR ============
export function authenticate(db, username, password) {
    var user, hashedPassword, isValid;
    
    var sql = 'SELECT id, username, password_hash FROM user WHERE username = ?';
    var stmt = db.prepare(sql);
    user = stmt.get(username);
    
    if (!user) {
        return { success: false, code: 401, message: 'Usuario no encontrado' };
    }

    hashedPassword = hashSHA256(password);
    isValid = (user.password_hash === hashedPassword);
    
    if (!isValid) {
        return { success: false, code: 401, message: 'Contraseña incorrecta' };
    }

    var session = getSession(user.id);
    if (!session) {
        session = createSession(user.id, user.username);
    } else {
        session.status = 'active';
    }

    return {
        success: true,
        code: 200,
        userId: user.id,
        username: user.username,
        session: session
    };
}

// ============ LOGOUT ============
export function logout(userId) {
    var session = getSession(userId);
    if (session) {
        session.status = 'disabled';
        return { success: true, message: 'Sesión cerrada' };
    }
    return { success: false, message: 'No hay sesión activa' };
}

// ============ AUTORIZADOR ============
export function authorize(db, userId, endpointPath) {
    var sql = `
        SELECT COUNT(*) as total
        FROM access a
        JOIN members m ON a.id_group = m.id_group
        JOIN endpoint e ON a.id_endpoint = e.id
        WHERE m.id_user = ? AND e.path = ?
    `;
    var stmt = db.prepare(sql);
    var row = stmt.get(userId, endpointPath);
    return row.total > 0;
}

// ============ VALIDAR CABECERAS ============
export function validateHeaders(headers) {
    var userId = headers['x-user-id'];
    var auth = headers['authorization'];
    
    if (!userId) {
        return { valid: false, code: 401, message: 'X-User-Id requerido' };
    }
    
    if (!auth) {
        return { valid: false, code: 401, message: 'Authorization requerido' };
    }
    
    var parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return { valid: false, code: 401, message: 'Authorization debe ser: Bearer <token>' };
    }
    
    var userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
        return { valid: false, code: 400, message: 'X-User-Id debe ser número' };
    }
    
    return { valid: true, userId: userIdNum, token: parts[1] };
}