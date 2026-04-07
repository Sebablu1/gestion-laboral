// ==================== ADMIN: ADICIONALES ====================
function renderAdicionalesAdmin() {
    const container = document.getElementById('listaAdicionales');
    if (!container) return;
    if (window.adicionales.length === 0) {
        container.innerHTML = '<div class="empty-message">🎁 No hay adicionales configurados</div>';
        return;
    }
    container.innerHTML = window.adicionales.map((ad, i) => {
        const emp = window.usuarios.find(u => u.id === ad.empleadoId);
        return `
            <div class="item-row">
                <div><strong>👤 ${emp?.nombre || 'N/A'}</strong> - 🎁 ${ad.nombre} - ${ad.tipo === 'fijo' ? formatoUY.format(ad.valor) : `${ad.valor}%`}</div>
                <button class="btn-delete" onclick="eliminarAdicional(${i})">🗑️</button>
            </div>
        `;
    }).join('');
}

function agregarAdicional() {
    const empleadoId = document.getElementById('adicionalEmpleado').value;
    const nombre = document.getElementById('nuevoAdicionalNombre').value.trim();
    const valorStr = document.getElementById('nuevoAdicionalValor').value.trim();
    const tipo = document.getElementById('nuevoAdicionalTipo').value;

    if (!empleadoId || !nombre || !valorStr) {
        mostrarNotificacion('Complete todos los campos', 'error');
        return;
    }

    let valor = parseFloat(valorStr);
    if (isNaN(valor) || valor <= 0) {
        mostrarNotificacion('Valor inválido', 'error');
        return;
    }

    window.adicionales.push({ id: Date.now().toString(), empleadoId, nombre, tipo, valor });
    guardarTodo();
    renderAdicionalesAdmin();
    document.getElementById('nuevoAdicionalNombre').value = '';
    document.getElementById('nuevoAdicionalValor').value = '';
    mostrarNotificacion('Adicional agregado', 'success');
}

function eliminarAdicional(idx) {
    window.adicionales.splice(idx, 1);
    guardarTodo();
    renderAdicionalesAdmin();
    mostrarNotificacion('Adicional eliminado', 'success');
}