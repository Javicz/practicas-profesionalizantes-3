// Configuración de la API
const API_URL = 'http://localhost:3000/api';

/**
 * Obtener todos los materiales
 */
async function obtenerMateriales() {
    try {
        const response = await fetch(`${API_URL}/materiales`);
        
        if (!response.ok) {
            throw new Error('Error al obtener materiales');
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error en obtenerMateriales:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Agregar nuevo material
 */
async function agregarMaterial(nombre, unidadMedida) {
    try {
        const response = await fetch(`${API_URL}/materiales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                unidad_medida: unidadMedida
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.error || 'Error al agregar material' };
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('Error en agregarMaterial:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Registrar compra
 */
async function registrarCompra(materialId, cantidad) {
    try {
        const response = await fetch(`${API_URL}/operaciones/comprar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                materialId: materialId,
                cantidad: cantidad
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.error || 'Error al registrar compra' };
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('Error en registrarCompra:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Registrar venta
 */
async function registrarVenta(materialId, cantidad) {
    try {
        const response = await fetch(`${API_URL}/operaciones/vender`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                materialId: materialId,
                cantidad: cantidad
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.error || 'Error al registrar venta' };
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('Error en registrarVenta:', error);
        return { success: false, error: error.message };
    }
}