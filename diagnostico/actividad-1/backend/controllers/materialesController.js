const pool = require('../config/db');

/**
 * Obtener todos los materiales
 * GET /api/materiales
 */
async function getAllMateriales(req, res) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, nombre, unidad_medida, cantidad FROM materiales ORDER BY nombre'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener materiales:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

/**
 * Agregar un nuevo material
 * POST /api/materiales
 * Body: { nombre, unidad_medida }
 */
async function createMaterial(req, res) {
    const { nombre, unidad_medida } = req.body;
    
    // Validaciones básicas
    if (!nombre || !unidad_medida) {
        return res.status(400).json({ 
            error: 'Nombre y unidad de medida son requeridos' 
        });
    }
    
    // Validar unidad de medida permitida
    const unidadesPermitidas = ['kg', 'm³', 'unidades'];
    if (!unidadesPermitidas.includes(unidad_medida)) {
        return res.status(400).json({ 
            error: 'Unidad de medida no válida. Use: kg, m³ o unidades' 
        });
    }
    
    try {
        // Intentar insertar el nuevo material
        const [result] = await pool.execute(
            'INSERT INTO materiales (nombre, unidad_medida, cantidad) VALUES (?, ?, 0)',
            [nombre, unidad_medida]
        );
        
        res.status(201).json({
            message: 'Material agregado exitosamente',
            material: {
                id: result.insertId,
                nombre,
                unidad_medida,
                cantidad: 0
            }
        });
    } catch (error) {
        // Error 1062 es por duplicado (UNIQUE constraint)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                error: 'Ya existe un material con ese nombre' 
            });
        }
        console.error('Error al crear material:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    getAllMateriales,
    createMaterial
};