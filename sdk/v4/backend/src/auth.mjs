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

export function disableSession(userId) {
    var session = sessions.get(userId);
    if (session) {
        session.status = 'disabled';
        return session;
    }
    return null;
}

export function isSessionActive(userId) {
    var session = getSession(userId);
    return session && session.status === 'active';
}

// ============ AUTENTICADOR ============
export function authenticate(db, username, password) {
    var user, hashedPassword, isValid, session;
    
    return getUserByUsername(db, username)
        .then(function(userData) {
            user = userData;
            
            if (!user) {
                return { success: false, code: 401, message: 'Usuario no encontrado' };
            }

            hashedPassword = hashSHA256(password);
            isValid = (user.password_hash === hashedPassword);
            
            if (!isValid) {
                return { success: false, code: 401, message: 'Contraseña incorrecta' };
            }

            session = getSession(user.id);
            if (session && session.status === 'active') {
                return {
                    success: true,
                    code: 200,
                    userId: user.id,
                    username: user.username,
                    session: session,
                    message: 'Sesión recuperada'
                };
            }

            session = createSession(user.id, user.username);
            return {
                success: true,
                code: 200,
                userId: user.id,
                username: user.username,
                session: session,
                message: 'Sesión creada'
            };
        });
}

// ============ LOGOUT ============
export function logout(userId) {
    var session = disableSession(userId);
    if (session) {
        return { success: true, code: 200, message: 'Sesión cerrada correctamente' };
    }
    return { success: false, code: 400, message: 'No hay sesión activa' };
}

// ============ AUTORIZADOR ============
export function authorize(db, userId, endpointPath) {
    return userHasPermission(db, userId, endpointPath);
}

// ============ VALIDAR CABECERAS (CORREGIDO) ============
export function validateHeaders(headers) {
    var userId = headers['x-user-id'];
    var auth = headers['authorization'];
    
    console.log('📋 Validando cabeceras:', { userId: userId, auth: auth });
    
    if (!userId) {
        console.warn('❌ X-User-Id no encontrado');
        return { valid: false, code: 401, message: 'X-User-Id requerido' };
    }
    
    if (!auth) {
        console.warn('❌ Authorization no encontrado');
        return { valid: false, code: 401, message: 'Authorization requerido' };
    }
    
    var parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.warn('❌ Authorization mal formado:', auth);
        return { valid: false, code: 401, message: 'Authorization debe ser: Bearer <token>' };
    }
    
    var userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
        console.warn('❌ userId no es número:', userId);
        return { valid: false, code: 400, message: 'X-User-Id debe ser número' };
    }
    
    console.log('✅ Cabeceras válidas - userId:', userIdNum);
    return { valid: true, userId: userIdNum, token: parts[1] };
}