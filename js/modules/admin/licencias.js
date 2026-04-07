// ==================== ADMIN: LICENCIAS ====================
function renderLicenciasAdmin() {
    const container = document.getElementById('listaLicencias');
    if (!container) return;
    if (window.licencias.length === 0) {
        container.innerHTML = '<div class="empty-message">🏖️ No hay solicitudes de licencia</div>';
        return;
    }
    container.innerHTML = window.licencias.map(l => {
        const emp = window.usuarios.find(u => u.id === l.usuarioId);
        return `
            <div class="item-row">
                <div><strong>${emp?.nombre}</strong> - ${l.mes} - ${l.dias} días - ${l.aprobada ? '✅ Aprobada' : '⏳ Pendiente'}</div>
                <div>
                    ${!l.aprobada ? `<button class="btn-delete" style="background:#10b981" onclick="aprobarLicencia('${l.id}')">✓</button>` : ''}
                    <button class="btn-delete" onclick="eliminarLicencia('${l.id}')">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function solicitarLicencia() {
    const empleadoId = document.getElementById('licenciaEmpleado').value;
    const mes = document.getElementById('licenciaMes').value;
    const dias = parseInt(document.getElementById('licenciaDias').value);

    if (!empleadoId || !mes || !dias || dias <= 0) {
        mostrarNotificacion('Complete los campos', 'error');
        return;
    }

    window.licencias.push({
        id: Date.now().toString(), usuarioId: empleadoId,
        mes, dias, aprobada: false, fechaSolicitud: new Date().toISOString()
    });
    guardarTodo();
    renderLicenciasAdmin();
    document.getElementById('licenciaMes').value = '';
    document.getElementById('licenciaDias').value = '';
    mostrarNotificacion('Solicitud registrada', 'success');
}

function aprobarLicencia(id) {
    const lic = window.licencias.find(l => l.id === id);
    if (lic) {
        lic.aprobada = true;
        guardarTodo();
        renderLicenciasAdmin();
        mostrarNotificacion('Licencia aprobada', 'success');
    }
}

function eliminarLicencia(id) {
    mostrarConfirmacion('¿Eliminar esta licencia?', () => {
        window.licencias = window.licencias.filter(l => l.id !== id);
        guardarTodo();
        renderLicenciasAdmin();
        mostrarNotificacion('Licencia eliminada', 'success');
    });
}