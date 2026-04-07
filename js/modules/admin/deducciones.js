// ==================== ADMIN: DEDUCCIONES ====================
function renderDeduccionesAdmin() {
    const container = document.getElementById('listaDeducciones');
    if (!container) return;
    if (window.deducciones.length === 0) {
        container.innerHTML = '<div class="empty-message">📉 No hay retenciones configuradas</div>';
        return;
    }
    container.innerHTML = window.deducciones.map((d, i) => `
        <div class="item-row">
            <span><strong>${d.nombre}</strong> - ${d.tipo === 'fijo' ? formatoUY.format(d.valor) : `${d.valor}%`}</span>
            <button class="btn-delete" onclick="eliminarDeduccion(${i})">🗑️</button>
        </div>
    `).join('');
}

function agregarDeduccion() {
    const nombre = document.getElementById('nuevaDedNombre').value.trim();
    const valorStr = document.getElementById('nuevaDedValor').value.trim();
    const tipo = document.getElementById('nuevaDedTipo').value;

    if (!nombre || !valorStr) {
        mostrarNotificacion('Complete los campos', 'error');
        return;
    }

    let valor = parseFloat(valorStr);
    if (isNaN(valor) || valor <= 0) {
        mostrarNotificacion('Valor inválido', 'error');
        return;
    }

    window.deducciones.push({ id: Date.now().toString(), nombre, tipo, valor });
    guardarTodo();
    renderDeduccionesAdmin();
    document.getElementById('nuevaDedNombre').value = '';
    document.getElementById('nuevaDedValor').value = '';
    mostrarNotificacion('Retención agregada', 'success');
}

function eliminarDeduccion(idx) {
    window.deducciones.splice(idx, 1);
    guardarTodo();
    renderDeduccionesAdmin();
    mostrarNotificacion('Retención eliminada', 'success');
}