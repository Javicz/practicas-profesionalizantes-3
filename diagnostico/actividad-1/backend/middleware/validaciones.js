/**
 * Valida que la cantidad sea un número positivo
 */
function validarCantidad(req, res, next) {
    const { cantidad } = req.body;
    
    // Verificar que cantidad exista y sea un número
    if (cantidad === undefined || isNaN(parseFloat(cantidad))) {
        return res.status(400).json({ 
            error: 'La cantidad es requerida y debe ser un número' 
        });
    }
    
    const cantidadNum = parseFloat(cantidad);
    
    // Verificar que sea mayor a 0
    if (cantidadNum <= 0) {
        return res.status(400).json({ 
            error: 'La cantidad debe ser mayor a 0' 
        });
    }
    
    // Guardar la cantidad numérica en req para usarla después
    req.cantidadValida = cantidadNum;
    next();
}

/**
 * Valida que el material exista en la base de datos
 */
async function validarMaterialExistente(req, res, next) {
    const { materialId, nombre } = req.body;
    const pool = require('../config/db');
    
    let material;
    
    if (materialId) {
        // Buscar por ID
        const [rows] = await pool.execute(
            'SELECT * FROM materiales WHERE id = ?',
            [materialId]
        );
        material = rows[0];
    } else if (nombre) {
        // Buscar por nombre
        const [rows] = await pool.execute(
            'SELECT * FROM materiales WHERE nombre = ?',
            [nombre]
        );
        material = rows[0];
    }
    
    if (!material) {
        return res.status(404).json({ 
            error: 'Material no encontrado' 
        });
    }
    
    req.material = material;
    next();
}

module.exports = {
    validarCantidad,
    validarMaterialExistente
};