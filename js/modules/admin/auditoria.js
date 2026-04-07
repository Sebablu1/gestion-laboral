// ==================== ADMIN: AUDITORÍA ====================
function renderAuditoria() {
    const tbody = document.getElementById('tablaAuditoria');
    if (!tbody) return;
    if (window.auditoria.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">📋 No hay registros de auditoría</td></tr>';
        return;
    }
    tbody.innerHTML = window.auditoria.slice(0, 50).map(a => `<tr>
        <td>${new Date(a.fecha).toLocaleString()}</td>
        <td>${a.usuario}</td>
        <td>${a.accion}</td>
        <td>${a.detalle}</td>
    </tr>`).join('');
}