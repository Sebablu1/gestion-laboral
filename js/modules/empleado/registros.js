// ==================== EMPLEADO: REGISTROS ====================
function renderMisRegistros() {
    const mes = document.getElementById('filtroMesEmpleado').value || new Date().toISOString().slice(0, 7);
    const misRegistros = window.registros.filter(r => r.usuarioId === window.usuarioActual.id && r.fecha.startsWith(mes));
    misRegistros.sort((a, b) => b.fecha.localeCompare(a.fecha));
    
    let totalHoras = 0;
    misRegistros.forEach(r => {
        if (r.entrada && r.salida) totalHoras += calcularHorasProfesional(r.entrada, r.salida);
    });
    
    const puestoEmp = window.puestos.find(p => p.id === window.usuarioActual.puestoId);
    const horasContrato = puestoEmp?.horasMensuales || 44;
    const porcentaje = Math.min(100, (totalHoras / horasContrato) * 100);
    
    document.getElementById('resumenHorasEmpleado').innerHTML = `
        <div class="progress-bar"><div class="progress-fill" style="width: ${porcentaje}%"></div></div>
        <p>📊 Horas: ${formatearHoras(totalHoras)} / ${formatearHoras(horasContrato)} (${porcentaje.toFixed(1)}%)</p>
    `;
    
    const tbody = document.getElementById('tablaRegistros');
    if (misRegistros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">📋 No hay registros</td></tr>';
    } else {
        tbody.innerHTML = misRegistros.map(r => {
            let horas = '-';
            if (r.entrada && r.salida) horas = formatearHoras(calcularHorasProfesional(r.entrada, r.salida));
            return `<tr><td>${r.fecha}</td><td>${r.entrada || '-'}</td><td>${r.salida || '-'}</td><td>${horas}</td></tr>`;
        }).join('');
    }
}

function solicitarCorreccion() {
    const fecha = document.getElementById('fechaCorreccion').value;
    const nuevaEntrada = document.getElementById('nuevaEntrada').value;
    const nuevaSalida = document.getElementById('nuevaSalida').value;
    const motivo = document.getElementById('motivoCorreccion').value.trim();
    
    if (!fecha) {
        mostrarNotificacion('Seleccione una fecha', 'error');
        return;
    }
    
    if (!nuevaEntrada && !nuevaSalida) {
        mostrarNotificacion('Ingrese al menos un cambio (entrada o salida)', 'error');
        return;
    }
    
    if (!motivo) {
        mostrarNotificacion('Ingrese un motivo para la corrección', 'error');
        return;
    }
    
    agregarSolicitudCorreccion(window.usuarioActual.id, fecha, nuevaEntrada, nuevaSalida, motivo);
    
    // Limpiar formulario
    document.getElementById('fechaCorreccion').value = '';
    document.getElementById('nuevaEntrada').value = '';
    document.getElementById('nuevaSalida').value = '';
    document.getElementById('motivoCorreccion').value = '';
}