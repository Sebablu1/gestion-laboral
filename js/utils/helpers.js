// ==================== HELPERS ====================
const formatoUY = new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

function verificarPassword(password, hash) {
    return hashPassword(password) === hash;
}

function formatearHoras(horas) {
    if (isNaN(horas) || horas === null || horas === undefined) return "0h 0m";
    const horasEnteras = Math.floor(horas);
    const minutos = Math.round((horas - horasEnteras) * 60);
    return `${horasEnteras}h ${minutos}m`;
}

function calcularHorasProfesional(entrada, salida) {
    if (!entrada || !salida) return 0;
    const [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
    const [horaSalida, minutoSalida] = salida.split(':').map(Number);
    let horas = horaSalida - horaEntrada;
    let minutos = minutoSalida - minutoEntrada;
    if (minutos < 0) { horas--; minutos += 60; }
    if (horas < 0) { horas += 24; }
    return parseFloat((horas + minutos / 60).toFixed(2));
}

function calcularHorasTranscurridas(entrada) {
    if (!entrada) return 0;
    const ahora = new Date();
    const [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
    const hoyInicio = new Date();
    hoyInicio.setHours(horaEntrada, minutoEntrada, 0);
    let diff = (ahora - hoyInicio) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    return parseFloat(Math.max(0, diff).toFixed(2));
}
// Función para escapar HTML y prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Hash de contraseñas con CryptoJS
function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = `notification notification-${tipo}`;
    notif.innerHTML = `
        <span>${mensaje}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(notif);
    
    setTimeout(() => {
        if (notif.parentElement) notif.remove();
    }, 5000);
}

function mostrarConfirmacion(mensaje, onConfirm) {
    if (confirm(mensaje)) {
        onConfirm();
    }
}