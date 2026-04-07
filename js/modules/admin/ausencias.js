// ==================== ADMIN: AUSENCIAS ====================
function renderAusenciasAdmin() {
    const tbody = document.getElementById('tablaAusencias');
    if (!tbody) return;
    if (window.ausencias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">📋 No hay ausencias registradas</td></tr>';
        return;
    }
    tbody.innerHTML = window.ausencias.map(a => {
        const emp = window.usuarios.find(u => u.id === a.usuarioId);
        return `<tr>
            <td>${emp?.nombre || 'N/A'}</td>
            <td>${a.fecha}</td>
            <td>${a.tipo}</td>
            <td>${a.horas}h</td>
            <td>${a.motivo || '-'}</td>
            <td><button class="btn-delete" onclick="eliminarAusencia('${a.id}')">🗑️</button></td>
        </tr>`;
    }).join('');
}

function registrarAusencia() {
    const empleadoId = document.getElementById('ausenciaEmpleado').value;
    const fecha = document.getElementById('ausenciaFecha').value;
    const tipo = document.getElementById('ausenciaTipo').value;
    const horas = parseFloat(document.getElementById('ausenciaHoras').value);
    const motivo = document.getElementById('ausenciaMotivo').value;

    if (!empleadoId || !fecha || !horas || horas <= 0) {
        mostrarNotificacion('Complete los campos', 'error');
        return;
    }

    window.ausencias.push({
        id: Date.now().toString(), usuarioId: empleadoId,
        fecha, tipo, horas, motivo, registradaPor: window.usuarioActual?.nombre
    });
    guardarTodo();
    renderAusenciasAdmin();
    document.getElementById('ausenciaFecha').value = '';
    document.getElementById('ausenciaMotivo').value = '';
    mostrarNotificacion('Ausencia registrada', 'success');
}

function eliminarAusencia(id) {
    mostrarConfirmacion('¿Eliminar esta ausencia?', () => {
        window.ausencias = window.ausencias.filter(a => a.id !== id);
        guardarTodo();
        renderAusenciasAdmin();
        mostrarNotificacion('Ausencia eliminada', 'success');
    });
}