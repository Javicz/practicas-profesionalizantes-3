// Variables globales
let materiales = [];

/**
 * Inicializar la aplicación
 */
async function init() {
    console.log('🚀 Inicializando aplicación...');
    
    // Cargar materiales al iniciar
    await cargarMateriales();
    
    // Configurar event listeners
    configurarEventListeners();
}

/**
 * Cargar materiales desde el backend
 */
async function cargarMateriales() {
    const resultado = await obtenerMateriales();
    
    if (resultado.success) {
        materiales = resultado.data;
        renderizarTablaMateriales(materiales);
    } else {
        mostrarAlerta('Error al cargar materiales: ' + resultado.error, 'error');
    }
}

/**
 * Configurar todos los event listeners
 */
function configurarEventListeners() {
    // Formulario de nuevo material
    const nuevoMaterialForm = document.getElementById('nuevo-material-form');
    if (nuevoMaterialForm) {
        nuevoMaterialForm.addEventListener('submit', handleNuevoMaterial);
    }
    
    // Formulario de operación (compra/venta)
    const operacionForm = document.getElementById('operacion-form');
    if (operacionForm) {
        operacionForm.addEventListener('submit', handleOperacion);
    }
    
    // Exponer handlers para los botones de la tabla
    window.registrarCompraHandler = registrarCompraHandler;
    window.registrarVentaHandler = registrarVentaHandler;
}

/**
 * Manejar el envío del formulario de nuevo material
 */
async function handleNuevoMaterial(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const unidadMedida = document.getElementById('unidad').value;
    
    if (!nombre || !unidadMedida) {
        mostrarAlerta('Por favor complete todos los campos', 'error');
        return;
    }
    
    const resultado = await agregarMaterial(nombre, unidadMedida);
    
    if (resultado.success) {
        mostrarAlerta(`Material "${nombre}" agregado exitosamente`, 'success');
        // Limpiar formulario
        document.getElementById('nuevo-material-form').reset();
        // Recargar la tabla
        await cargarMateriales();
    } else {
        mostrarAlerta(resultado.error, 'error');
    }
}

/**
 * Manejar el envío del formulario de operación
 */
async function handleOperacion(event) {
    event.preventDefault();
    
    const materialId = document.getElementById('material-id').value;
    const cantidad = document.getElementById('cantidad').value;
    const tipo = document.getElementById('tipo-operacion').value;
    
    if (!materialId || !cantidad || !tipo) {
        mostrarAlerta('Por favor complete todos los campos', 'error');
        return;
    }
    
    const cantidadNum = parseFloat(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
        mostrarAlerta('La cantidad debe ser un número mayor a 0', 'error');
        return;
    }
    
    let resultado;
    
    if (tipo === 'compra') {
        resultado = await registrarCompra(parseInt(materialId), cantidadNum);
    } else {
        resultado = await registrarVenta(parseInt(materialId), cantidadNum);
    }
    
    if (resultado.success) {
        const tipoTexto = tipo === 'compra' ? 'compra' : 'venta';
        mostrarAlerta(`${tipoTexto.toUpperCase()} registrada exitosamente`, 'success');
        // Limpiar formulario
        document.getElementById('operacion-form').reset();
        // Recargar la tabla
        await cargarMateriales();
    } else {
        mostrarAlerta(resultado.error, 'error');
    }
}

/**
 * Handler para registrar compra desde los botones de la tabla
 */
async function registrarCompraHandler(materialId, cantidad) {
    const resultado = await registrarCompra(materialId, cantidad);
    
    if (resultado.success) {
        mostrarAlerta(`Compra registrada exitosamente`, 'success');
        await cargarMateriales();
    } else {
        mostrarAlerta(resultado.error, 'error');
    }
}

/**
 * Handler para registrar venta desde los botones de la tabla
 */
async function registrarVentaHandler(materialId, cantidad) {
    const resultado = await registrarVenta(materialId, cantidad);
    
    if (resultado.success) {
        mostrarAlerta(`Venta registrada exitosamente`, 'success');
        await cargarMateriales();
    } else {
        mostrarAlerta(resultado.error, 'error');
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);