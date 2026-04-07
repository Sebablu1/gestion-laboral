// ==================== ADMIN: ÁREAS ====================
function renderAreas() {
    const container = document.getElementById('listaAreas');
    if (!container) return;
    container.innerHTML = window.areas.map((area, i) => `
        <div class="item-row">
            <span><strong>${area.nombre}</strong> (ID: ${area.id})</span>
            <button class="btn-delete" onclick="eliminarArea('${area.id}')">🗑️</button>
        </div>
    `).join('');
}

function agregarArea() {
    const nombre = document.getElementById('nuevaAreaNombre').value.trim();
    if (nombre && !window.areas.some(a => a.nombre === nombre)) {
        const nuevaArea = {
            id: Date.now().toString(),
            nombre: nombre
        };
        window.areas.push(nuevaArea);
        guardarTodo();
        renderAreas();
        actualizarSelectsGlobal();
        document.getElementById('nuevaAreaNombre').value = '';
        mostrarNotificacion(`Área "${nombre}" agregada`, 'success');
        
        // Actualizar dashboard si está visible
        if (typeof renderDashboard === 'function') renderDashboard();
    } else {
        mostrarNotificacion('Área inválida o ya existe', 'error');
    }
}

function eliminarArea(id) {
    const area = window.areas.find(a => a.id === id);
    mostrarConfirmacion(`¿Eliminar área "${area?.nombre}"?`, () => {
        window.areas = window.areas.filter(a => a.id !== id);
        guardarTodo();
        renderAreas();
        actualizarSelectsGlobal();
        mostrarNotificacion(`Área eliminada`, 'success');
        if (typeof renderDashboard === 'function') renderDashboard();
    });
}