// ==================== ADMIN: PUESTOS ====================

function renderPuestos() {
    const container = document.getElementById('listaPuestos');
    if (!container) return;
    
    if (window.puestos.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No hay puestos creados. Agregue uno usando el formulario.</p>';
        return;
    }
    
    container.innerHTML = window.puestos.map((puesto) => {
        let nombreArea = puesto.area;
        if (typeof puesto.area === 'object') {
            nombreArea = puesto.area.nombre || 'Sin área';
        }
        
        return `
            <div class="item-row">
                <div style="flex: 2;">
                    <strong>${escapeHtml(puesto.nombre)}</strong><br>
                    <small>Área: ${escapeHtml(nombreArea)} | Sueldo: ${window.formatoUY.format(puesto.sueldoMensual)} | Horas: ${puesto.horasMensuales}/mes</small>
                </div>
                <button class="btn-delete" onclick="eliminarPuesto('${puesto.id}')">🗑️</button>
            </div>
        `;
    }).join('');
}

function agregarPuesto() {
    const nombre = document.getElementById('nuevoPuestoNombre').value.trim();
    const areaSelect = document.getElementById('nuevoPuestoArea');
    const areaId = areaSelect.value;
    const sueldoMensual = parseFloat(document.getElementById('nuevoPuestoSueldo').value);
    const horasMensuales = parseFloat(document.getElementById('nuevoPuestoHoras').value);
    
    if (!nombre || !areaId || isNaN(sueldoMensual) || isNaN(horasMensuales) || sueldoMensual <= 0 || horasMensuales <= 0) {
        mostrarNotificacion('Complete todos los campos correctamente', 'error');
        return;
    }
    
    const areaObj = window.areas.find(a => a.id === areaId);
    if (!areaObj) {
        mostrarNotificacion('Área no válida', 'error');
        return;
    }
    
    const nuevoPuesto = {
        id: Date.now().toString(),
        nombre: nombre,
        area: areaObj.nombre,
        areaId: areaId,
        sueldoMensual: sueldoMensual,
        horasMensuales: horasMensuales,
        valorHora: sueldoMensual / horasMensuales
    };
    
    window.puestos.push(nuevoPuesto);
    guardarTodo();
    renderPuestos();
    actualizarSelectsGlobal();
    
    document.getElementById('nuevoPuestoNombre').value = '';
    document.getElementById('nuevoPuestoSueldo').value = '';
    document.getElementById('nuevoPuestoHoras').value = '44';
    document.getElementById('nuevoPuestoArea').value = '';
    
    mostrarNotificacion(`Puesto "${nombre}" agregado`, 'success');
    if (typeof renderDashboard === 'function') renderDashboard();
}

function eliminarPuesto(id) {
    const puesto = window.puestos.find(p => p.id === id);
    if (!puesto) return;
    
    mostrarConfirmacion(`¿Eliminar puesto "${puesto.nombre}"?`, () => {
        window.puestos = window.puestos.filter(p => p.id !== id);
        guardarTodo();
        renderPuestos();
        actualizarSelectsGlobal();
        mostrarNotificacion('Puesto eliminado', 'success');
        if (typeof renderDashboard === 'function') renderDashboard();
    });
}

function actualizarSelectsGlobal() {
    // Select de áreas en puestos
    const selectArea = document.getElementById('nuevoPuestoArea');
    if (selectArea) {
        selectArea.innerHTML = '<option value="">Seleccionar área</option>';
        window.areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.nombre;
            selectArea.appendChild(option);
        });
    }
    
    // Select de puestos en usuarios
    const selectPuesto = document.getElementById('nuevoUserPuesto');
    if (selectPuesto) {
        selectPuesto.innerHTML = '<option value="">Seleccionar puesto</option>';
        window.puestos.forEach(puesto => {
            const option = document.createElement('option');
            option.value = puesto.id;
            option.textContent = `${puesto.nombre} - ${puesto.area} (${window.formatoUY.format(puesto.sueldoMensual)})`;
            selectPuesto.appendChild(option);
        });
    }
    
    // Selects de empleados
    const empleados = window.usuarios.filter(u => u.rol === 'empleado' && u.activo !== false);
    const selects = ['ausenciaEmpleado', 'licenciaEmpleado', 'adicionalEmpleado', 'adminSelectEmpleado'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Seleccionar empleado</option>';
            empleados.forEach(empleado => {
                const option = document.createElement('option');
                option.value = empleado.id;
                option.textContent = empleado.nombre;
                select.appendChild(option);
            });
        }
    });
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exportar funciones al scope global
window.renderPuestos = renderPuestos;
window.agregarPuesto = agregarPuesto;
window.eliminarPuesto = eliminarPuesto;
window.actualizarSelectsGlobal = actualizarSelectsGlobal;