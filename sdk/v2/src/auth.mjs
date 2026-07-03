import { createHash } from 'node:crypto';
import { getUserByUsername, userHasPermission } from './model.mjs';

// ============ SHA256 ============
export function hashSHA256(text) {
    return createHash('sha256')
        .update(text)
        .digest('hex');
}

// ============ SESIONES EN MEMORIA ============
var sessions = new Map();

export function getSession(username) {
    return sessions.get(username) || null;
}

export function createSession(username) {
    var session = {
        username: username,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    sessions.set(username, session);
    return session;
}

export function disableSession(username) {
    var session = sessions.get(username);
    if (session) {
        session.status = 'disabled';
        return session;
    }
    return null;
}

export function isSessionActive(username) {
    var session = getSession(username);
    return session && session.status === 'active';
}

// ============ AUTENTICADOR ============
export function authenticate(db, username, password) {
    var user, hashedPassword, isValid, session;
    
    return getUserByUsername(db, username)
        .then(function(userData) {
            user = userData;
            
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            hashedPassword = hashSHA256(password);
            isValid = (user.password_hash === hashedPassword);
            
            if (!isValid) {
                return { success: false, message: 'Contraseña incorrecta' };
            }

            session = getSession(username);
            if (session && session.status === 'active') {
                return {
                    success: true,
                    user: { id: user.id, username: user.username },
                    session: session,
                    message: 'Sesión recuperada'
                };
            }

            session = createSession(username);
            return {
                success: true,
                user: { id: user.id, username: user.username },
                session: session,
                message: 'Sesión creada'
            };
        });
}

// ============ LOGOUT ============
export function logout(username) {
    var session = disableSession(username);
    if (session) {
        return { success: true, message: 'Sesión cerrada correctamente' };
    }
    return { success: false, message: 'No hay sesión activa' };
}

// ============ AUTORIZADOR ============
export function authorize(db, username, endpointPath) {
    return userHasPermission(db, username, endpointPath);
}