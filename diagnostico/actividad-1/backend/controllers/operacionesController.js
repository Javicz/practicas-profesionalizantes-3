const pool = require('../config/db');

/**
 * Registrar una compra (incrementar stock)
 * POST /api/operaciones/comprar
 * Body: { materialId, cantidad }
 */
async function registrarCompra(req, res) {
    const { materialId } = req.body;
    const cantidad = req.cantidadValida; // Viene del middleware
    
    try {
        // Actualizar stock (incrementar)
        const [result] = await pool.execute(
            'UPDATE materiales SET cantidad = cantidad + ? WHERE id = ?',
            [cantidad, materialId]
        );
        
        // Obtener el material actualizado
        const [material] = await pool.execute(
            'SELECT id, nombre, unidad_medida, cantidad FROM materiales WHERE id = ?',
            [materialId]
        );
        
        res.json({
            message: 'Compra registrada exitosamente',
            material: material[0],
            operacion: {
                tipo: 'compra',
                cantidad: cantidad,
                fecha: new Date()
            }
        });
    } catch (error) {
        console.error('Error al registrar compra:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

/**
 * Registrar una venta (decrementar stock con validación de stock negativo)
 * POST /api/operaciones/vender
 * Body: { materialId, cantidad }
 */
async function registrarVenta(req, res) {
    const { materialId } = req.body;
    const cantidad = req.cantidadValida;
    const material = req.material;
    
    // Verificar que haya suficiente stock
    if (material.cantidad < cantidad) {
        return res.status(400).json({ 
            error: 'Stock insuficiente',
            disponible: material.cantidad,
            solicitado: cantidad
        });
    }
    
    try {
        // Actualizar stock (decrementar)
        const [result] = await pool.execute(
            'UPDATE materiales SET cantidad = cantidad - ? WHERE id = ?',
            [cantidad, materialId]
        );
        
        // Obtener el material actualizado
        const [materialActualizado] = await pool.execute(
            'SELECT id, nombre, unidad_medida, cantidad FROM materiales WHERE id = ?',
            [materialId]
        );
        
        res.json({
            message: 'Venta registrada exitosamente',
            material: materialActualizado[0],
            operacion: {
                tipo: 'venta',
                cantidad: cantidad,
                fecha: new Date()
            }
        });
    } catch (error) {
        console.error('Error al registrar venta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    registrarCompra,
    registrarVenta
};