// ==================== ADMIN: MESES CERRADOS ====================
function renderMesesCerrados() {
    const container = document.getElementById('mesesCerradosList');
    if (!container) return;
    container.innerHTML = window.mesesCerrados.map(m => `
        <span class="mes-cerrado-badge">📅 ${m} <button onclick="abrirMes('${m}')">🔓</button></span>
    `).join('');
}

function cerrarMes() {
    const mes = document.getElementById('mesCierre').value;
    if (!mes) return;
    if (window.mesesCerrados.includes(mes)) {
        mostrarNotificacion('El mes ya está cerrado', 'warning');
        return;
    }
    mostrarConfirmacion(`¿Cerrar el mes ${mes}?`, () => {
        window.mesesCerrados.push(mes);
        guardarTodo();
        renderMesesCerrados();
        mostrarNotificacion(`Mes ${mes} cerrado`, 'success');
    });
}

function abrirMes(mes) {
    mostrarConfirmacion(`¿Reabrir el mes ${mes}?`, () => {
        window.mesesCerrados = window.mesesCerrados.filter(m => m !== mes);
        guardarTodo();
        renderMesesCerrados();
        mostrarNotificacion(`Mes ${mes} reabierto`, 'success');
    });
}