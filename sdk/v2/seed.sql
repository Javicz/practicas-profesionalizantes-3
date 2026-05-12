-- ============================================
-- SCRIPT DE INSERCIÓN MASIVA PARA PRUEBAS
-- Generado por IA para experimentar con RBAC
-- ============================================

-- 3. Endpoints (rutas protegidas) - ya creado arriba, asegurar
INSERT OR IGNORE INTO endpoint (path) VALUES 
('/'), ('/user'), ('/group'), ('/member'), ('/access'),
('/dashboard'), ('/reports'), ('/settings'), ('/profile'), ('/logs'),
('/api/v1/users'), ('/api/v1/products'), ('/api/v1/orders'), ('/admin/panel'), ('/metrics');

-- 4. Usuarios masivos (50 usuarios de prueba)
INSERT OR IGNORE INTO user (username, password) VALUES 
-- Administradores
('admin', 'admin123'),
('super.admin', 'admin123'),
-- Supervisores
('supervisor1', 'pass123'), ('supervisor2', 'pass123'), ('supervisor3', 'pass123'),
-- Editores
('editor1', 'pass123'), ('editor2', 'pass123'), ('editor3', 'pass123'), ('editor4', 'pass123'),
('editor5', 'pass123'), ('editor6', 'pass123'),
-- Vistas (viewers)
('viewer1', 'pass123'), ('viewer2', 'pass123'), ('viewer3', 'pass123'), ('viewer4', 'pass123'),
('viewer5', 'pass123'), ('viewer6', 'pass123'), ('viewer7', 'pass123'), ('viewer8', 'pass123'),
('viewer9', 'pass123'), ('viewer10', 'pass123'), ('viewer11', 'pass123'), ('viewer12', 'pass123'),
-- Analistas
('analyst1', 'pass123'), ('analyst2', 'pass123'), ('analyst3', 'pass123'), ('analyst4', 'pass123'),
('analyst5', 'pass123'), ('analyst6', 'pass123'),
-- Auditores
('auditor1', 'pass123'), ('auditor2', 'pass123'), ('auditor3', 'pass123'),
-- Usuarios regulares
('juan.perez', 'pass123'), ('maria.gomez', 'pass123'), ('carlos.lopez', 'pass123'),
('laura.martinez', 'pass123'), ('pedro.rodriguez', 'pass123'), ('ana.fernandez', 'pass123'),
('luis.garcia', 'pass123'), ('sofia.diaz', 'pass123'), ('diego.sanchez', 'pass123'),
('valentina.ramirez', 'pass123'), ('sebastian.flores', 'pass123'), ('camila.morales', 'pass123'),
('mateo.reyes', 'pass123'), ('isabella.castro', 'pass123'), ('nicolas.ortiz', 'pass123'),
('renata.silva', 'pass123'), ('emiliano.ruiz', 'pass123'), ('julieta.mendoza', 'pass123');

-- 5. Permisos (access) - qué grupo puede acceder a qué endpoint

-- Grupo admin (id=1): acceso a TODO
INSERT OR IGNORE INTO access (id_group, id_endpoint) 
SELECT 1, id FROM endpoint;

-- Grupo supervisor (id=2): /dashboard, /reports, /user, /api/v1/*
INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES 
(2, (SELECT id FROM endpoint WHERE path = '/dashboard')),
(2, (SELECT id FROM endpoint WHERE path = '/reports')),
(2, (SELECT id FROM endpoint WHERE path = '/user')),
(2, (SELECT id FROM endpoint WHERE path = '/api/v1/users')),
(2, (SELECT id FROM endpoint WHERE path = '/api/v1/products')),
(2, (SELECT id FROM endpoint WHERE path = '/api/v1/orders'));

-- Grupo editor (id=3): /dashboard, /profile, /api/v1/products, /api/v1/orders
INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES 
(3, (SELECT id FROM endpoint WHERE path = '/dashboard')),
(3, (SELECT id FROM endpoint WHERE path = '/profile')),
(3, (SELECT id FROM endpoint WHERE path = '/api/v1/products')),
(3, (SELECT id FROM endpoint WHERE path = '/api/v1/orders'));

-- Grupo viewer (id=4): solo / y /dashboard
INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES 
(4, (SELECT id FROM endpoint WHERE path = '/')),
(4, (SELECT id FROM endpoint WHERE path = '/dashboard'));

-- Grupo auditor (id=5): /logs, /reports, /api/v1/users (solo lectura)
INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES 
(5, (SELECT id FROM endpoint WHERE path = '/logs')),
(5, (SELECT id FROM endpoint WHERE path = '/reports')),
(5, (SELECT id FROM endpoint WHERE path = '/api/v1/users'));

-- Grupo analyst (id=6): /dashboard, /reports, /metrics
INSERT OR IGNORE INTO access (id_group, id_endpoint) VALUES 
(6, (SELECT id FROM endpoint WHERE path = '/dashboard')),
(6, (SELECT id FROM endpoint WHERE path = '/reports')),
(6, (SELECT id FROM endpoint WHERE path = '/metrics'));

-- 6. Asignar usuarios a grupos (members)
-- Admin (id=1) → grupo admin (id=1)
INSERT OR IGNORE INTO members (id_user, id_group) VALUES (1, 1);
INSERT OR IGNORE INTO members (id_user, id_group) VALUES (2, 1);  -- super.admin también admin

-- Supervisores (ids 3-5) → grupo supervisor (id=2)
INSERT OR IGNORE INTO members (id_user, id_group) VALUES (3, 2), (4, 2), (5, 2);

-- Editores (ids 6-11) → grupo editor (id=3)
INSERT OR IGNORE INTO members (id_user, id_group) VALUES 
(6, 3), (7, 3), (8, 3), (9, 3), (10, 3), (11, 3);

-- Viewers (ids 12-23) → grupo viewer (id=4)
INSERT OR IGNORE INTO members (id_user, id_group) VALUES 
(12, 4), (13, 4), (14, 4), (15, 4), (16, 4), (17, 4), (18, 4), (19, 4), (20, 4), (21, 4), (22, 4), (23, 4);

-- Analysts (ids 24-29) → grupo analyst (id=6)
INSERT OR IGNORE INTO members (id_user, id_group) VALUES 
(24, 6), (25, 6), (26, 6), (27, 6), (28, 6), (29, 6);

-- Auditores (ids 30-32) → grupo auditor (id=5)
INSERT OR IGNORE INTO members (id_user, id_group) VALUES (30, 5), (31, 5), (32, 5);

-- Usuarios regulares (ids 33-50) → múltiples grupos (viewer + analyst)
INSERT OR IGNORE INTO members (id_user, id_group) VALUES 
(33, 4), (34, 4), (35, 4), (36, 4), (37, 4), (38, 4), (39, 4), (40, 4),
(41, 6), (42, 6), (43, 6), (44, 6), (45, 6), (46, 6), (47, 6), (48, 6), (49, 6), (50, 6);

-- 7. Verificar resultados
SELECT '📊 RESUMEN DE DATOS CARGADOS:' as '';
SELECT COUNT(*) as total_usuarios FROM user;
SELECT COUNT(*) as total_grupos FROM "group";
SELECT COUNT(*) as total_endpoints FROM endpoint;
SELECT COUNT(*) as total_permisos FROM access;
SELECT COUNT(*) as total_asignaciones FROM members;

-- 8. Mostrar usuarios con sus grupos (para verificar)
SELECT '👥 USUARIOS CON SUS GRUPOS:' as '';
SELECT u.username, GROUP_CONCAT(g.name, ', ') as grupos
FROM user u
LEFT JOIN members m ON m.id_user = u.id
LEFT JOIN "group" g ON g.id = m.id_group
GROUP BY u.id
ORDER BY u.id
LIMIT 20;