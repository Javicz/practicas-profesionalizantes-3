/**
 * Mostrar mensaje de alerta temporal
 */
function mostrarAlerta(mensaje, tipo = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

/**
 * Renderizar la tabla de materiales
 */
function renderizarTablaMateriales(materiales) {
    const tbody = document.getElementById('materiales-body');
    
    if (!materiales || materiales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay materiales registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = materiales.map(material => {
        // Determinar clase CSS según unidad de medida
        let claseCantidad = '';
        switch(material.unidad_medida) {
            case 'kg':
                claseCantidad = 'cantidad-kg';
                break;
            case 'm³':
                claseCantidad = 'cantidad-m3';
                break;
            case 'unidades':
                claseCantidad = 'cantidad-unidades';
                break;
        }
        
        // Formatear cantidad (sin decimales si es unidades)
        let cantidadFormateada = material.cantidad;
        if (material.unidad_medida === 'unidades') {
            cantidadFormateada = Math.floor(material.cantidad);
        } else {
            cantidadFormateada = parseFloat(material.cantidad).toFixed(2);
        }
        
        return `
            <tr data-id="${material.id}">
                <td><strong>${escapeHtml(material.nombre)}</strong></td>
                <td>${material.unidad_medida}</td>
                <td class="cantidad ${claseCantidad}">${cantidadFormateada}</td>
                <td>
                    <button class="btn-comprar" onclick="abrirModalCompra(${material.id}, '${escapeHtml(material.nombre)}')">
                        📥 Comprar
                    </button>
                    <button class="btn-vender" onclick="abrirModalVenta(${material.id}, '${escapeHtml(material.nombre)}', ${material.cantidad})">
                        📤 Vender
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Actualizar el select del formulario de operaciones
    actualizarSelectMateriales(materiales);
}

/**
 * Actualizar el select de materiales en el formulario de operaciones
 */
function actualizarSelectMateriales(materiales) {
    const select = document.getElementById('material-id');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar material</option>' + 
        materiales.map(material => 
            `<option value="${material.id}">${escapeHtml(material.nombre)} (${material.unidad_medida})</option>`
        ).join('');
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Abrir modal para registrar compra (usando prompt simple por ahora)
 */
function abrirModalCompra(id, nombre) {
    const cantidad = prompt(`Ingrese la cantidad a COMPRAR de ${nombre}:`);
    
    if (cantidad !== null && cantidad !== '') {
        const cantidadNum = parseFloat(cantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            mostrarAlerta('Por favor ingrese una cantidad válida mayor a 0', 'error');
            return;
        }
        
        // Llamar a la función global registrarCompra (definida en app.js)
        if (window.registrarCompraHandler) {
            window.registrarCompraHandler(id, cantidadNum);
        }
    }
}

/**
 * Abrir modal para registrar venta
 */
function abrirModalVenta(id, nombre, stockActual) {
    const cantidad = prompt(`Stock actual: ${stockActual}\nIngrese la cantidad a VENDER de ${nombre}:`);
    
    if (cantidad !== null && cantidad !== '') {
        const cantidadNum = parseFloat(cantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            mostrarAlerta('Por favor ingrese una cantidad válida mayor a 0', 'error');
            return;
        }
        
        if (cantidadNum > stockActual) {
            mostrarAlerta(`Stock insuficiente. Stock actual: ${stockActual}`, 'error');
            return;
        }
        
        if (window.registrarVentaHandler) {
            window.registrarVentaHandler(id, cantidadNum);
        }
    }
}