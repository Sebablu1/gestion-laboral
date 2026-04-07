// ==================== UI ====================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function verificarPassword(password, hash) {
    return hashPassword(password) === hash;
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    const notif = document.createElement('div');
    notif.className = `notification ${tipo}`;
    const icono = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[tipo] || 'ℹ️';
    notif.innerHTML = `<span>${icono}</span> ${escapeHtml(mensaje)}`;
    container.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
}

function mostrarConfirmacion(mensaje, onConfirm, esCritico = false) {
    const modal = document.createElement('div');
    modal.className = 'modal-confirm';
    modal.innerHTML = `
        <div class="modal-confirm-content">
            <h3>${esCritico ? '⚠️ ACCIÓN CRÍTICA ⚠️' : 'Confirmar acción'}</h3>
            <p>${escapeHtml(mensaje)}</p>
            <div class="modal-confirm-buttons">
                <button class="btn" id="modalCancelar">Cancelar</button>
                <button class="btn ${esCritico ? 'btn-warning' : 'btn-danger'}" id="modalConfirmar">${esCritico ? 'Si, estoy seguro' : 'Confirmar'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('modalConfirmar').onclick = () => { onConfirm(); modal.remove(); };
    document.getElementById('modalCancelar').onclick = () => modal.remove();
}

function mostrarSpinner(mostrar) {
    let spinner = document.getElementById('globalSpinner');
    if (mostrar) {
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'globalSpinner';
            spinner.className = 'spinner-overlay';
            spinner.innerHTML = '<div class="spinner-large"></div>';
            document.body.appendChild(spinner);
        }
        spinner.style.display = 'flex';
    } else if (spinner) {
        spinner.style.display = 'none';
    }
}

function registrarAuditoria(accion, detalle) {
    if (!window.auditoria) window.auditoria = [];
    window.auditoria.unshift({
        id: Date.now(),
        fecha: new Date().toISOString(),
        usuario: window.usuarioActual?.nombre || 'sistema',
        accion: accion,
        detalle: detalle
    });
    if (window.auditoria.length > 100) window.auditoria.pop();
    if (typeof guardarTodo === 'function') guardarTodo();
}

function actualizarSelectsGlobal() {
    const empleados = (window.usuarios || []).filter(u => u.rol === 'empleado');
    
    const selects = ['ausenciaEmpleado', 'licenciaEmpleado', 'adminSelectEmpleado', 'adicionalEmpleado'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">Seleccionar empleado...</option>' + 
                empleados.map(e => `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`).join('');
        }
    });
    
    const areaSelect = document.getElementById('nuevoPuestoArea');
    if (areaSelect && window.areas) {
        areaSelect.innerHTML = '<option value="">Seleccionar área...</option>' + 
            window.areas.map(a => `<option value="${a.id || a}">${escapeHtml(a.nombre || a)}</option>`).join('');
    }
    
    const puestoSelect = document.getElementById('nuevoUserPuesto');
    if (puestoSelect && window.puestos) {
        puestoSelect.innerHTML = '<option value="">Seleccionar puesto...</option>' + 
            window.puestos.map(p => `<option value="${p.id}">${escapeHtml(p.nombre)} - ${window.formatoUY ? window.formatoUY.format(p.sueldoMensual) : p.sueldoMensual}</option>`).join('');
    }
}

function guardarEmpresa() {
    window.empresa.nombre = document.getElementById('empresaNombreInput').value;
    window.empresa.rut = document.getElementById('empresaRutInput').value;
    window.empresa.direccion = document.getElementById('empresaDirInput').value;
    window.empresa.logo = document.getElementById('empresaLogoInput').value || '🏢';
    if (typeof guardarTodo === 'function') guardarTodo();
    document.getElementById('empresaNombre').innerHTML = `${window.empresa.logo} ${window.empresa.nombre}`;
    document.getElementById('empresaRut').innerHTML = window.empresa.rut;
    document.getElementById('empresaLogo').innerHTML = window.empresa.logo;
    mostrarNotificacion('Datos actualizados', 'success');
}

function guardarConfiguracion() {
    window.config.extraPorcentaje = parseFloat(document.getElementById('extraPorcentaje').value) || 50;
    window.config.bpsPorcentaje = parseFloat(document.getElementById('bpsPorcentaje').value) || 15;
    window.config.fonasaPorcentaje = parseFloat(document.getElementById('fonasaPorcentaje').value) || 4.5;
    window.config.irpfPorcentaje = parseFloat(document.getElementById('irpfPorcentaje').value) || 0;
    window.config.jornadaDiaria = parseFloat(document.getElementById('jornadaDiaria').value) || 8;
    if (typeof guardarTodo === 'function') guardarTodo();
    mostrarNotificacion('Configuración guardada', 'success');
}

function cambiarPassword() {
    const actual = document.getElementById('empPassActual').value;
    const nueva = document.getElementById('empPassNueva').value;
    const confirmar = document.getElementById('empPassConfirm').value;
    
    if (!verificarPassword(actual, window.usuarioActual.password)) {
        mostrarNotificacion('Contraseña actual incorrecta', 'error');
        return;
    }
    if (nueva.length < 3) {
        mostrarNotificacion('Mínimo 3 caracteres', 'error');
        return;
    }
    if (nueva !== confirmar) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }
    
    window.usuarioActual.password = hashPassword(nueva);
    const idx = window.usuarios.findIndex(u => u.id === window.usuarioActual.id);
    if (idx !== -1) window.usuarios[idx].password = hashPassword(nueva);
    if (typeof guardarTodo === 'function') guardarTodo();
    
    document.getElementById('empPassActual').value = '';
    document.getElementById('empPassNueva').value = '';
    document.getElementById('empPassConfirm').value = '';
    mostrarNotificacion('Contraseña cambiada', 'success');
}

function cambiarPasswordAdmin() {
    const actual = document.getElementById('adminPassActual').value;
    const nueva = document.getElementById('adminPassNueva').value;
    const confirmar = document.getElementById('adminPassConfirm').value;
    
    if (!verificarPassword(actual, window.usuarioActual.password)) {
        mostrarNotificacion('Contraseña actual incorrecta', 'error');
        return;
    }
    if (nueva.length < 3) {
        mostrarNotificacion('Mínimo 3 caracteres', 'error');
        return;
    }
    if (nueva !== confirmar) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }
    
    window.usuarioActual.password = hashPassword(nueva);
    const idx = window.usuarios.findIndex(u => u.id === window.usuarioActual.id);
    if (idx !== -1) window.usuarios[idx].password = hashPassword(nueva);
    if (typeof guardarTodo === 'function') guardarTodo();
    
    document.getElementById('adminPassActual').value = '';
    document.getElementById('adminPassNueva').value = '';
    document.getElementById('adminPassConfirm').value = '';
    mostrarNotificacion('Contraseña de admin cambiada', 'success');
}

// ==================== NOTIFICACIONES ====================

function cargarNotificaciones() {
    const lista = document.getElementById('listaNotificaciones');
    const badge = document.getElementById('badgeNotificaciones');
    
    if (!lista) return;
    
    window.notificaciones = window.notificaciones || [];
    
    const noLeidas = window.notificaciones.filter(n => !n.leida).length;
    if (badge) {
        badge.textContent = noLeidas;
        badge.style.display = noLeidas > 0 ? 'flex' : 'none';
    }
    
    if (window.notificaciones.length === 0) {
        lista.innerHTML = '<div class="notificacion-vacia">📭 No hay notificaciones</div>';
        return;
    }
    
    lista.innerHTML = window.notificaciones.sort((a,b) => b.fecha - a.fecha).map(notif => `
        <div class="notificacion-item ${notif.leida ? 'leida' : 'no-leida'}" data-id="${notif.id}" onclick="navegarNotificacion('${notif.id}')">
            <div class="notificacion-icono">${notif.icono || '🔔'}</div>
            <div class="notificacion-contenido">
                <div class="notificacion-mensaje">${escapeHtml(notif.mensaje)}</div>
                <div class="notificacion-fecha">${new Date(notif.fecha).toLocaleString()}</div>
            </div>
            ${!notif.leida ? `<button class="notificacion-marcar" onclick="event.stopPropagation(); marcarNotificacionLeida('${notif.id}')">✓</button>` : ''}
        </div>
    `).join('');
}

function navegarNotificacion(id) {
    const notif = window.notificaciones.find(n => n.id === id);
    if (!notif) return;
    
    // Marcar como leída
    if (!notif.leida) {
        notif.leida = true;
        guardarTodo();
        cargarNotificaciones();
    }
    
    // Cerrar panel
    const panel = document.getElementById('panelNotificaciones');
    if (panel) panel.classList.add('hidden');
    
    // Navegar según el tipo de notificación
    if (notif.tipo === 'recibo' || notif.accion === 'verRecibo') {
        if (window.usuarioActual.rol === 'admin') {
            document.querySelector('.tab[data-tab="admin"]').click();
            document.querySelector('.sub-tab[data-subtab="finanzas"]').click();
        } else {
            document.querySelector('.tab[data-tab="empleado"]').click();
            // Scroll a la sección de recibos
            setTimeout(() => {
                document.getElementById('empleadoReciboContainer')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    } else if (notif.tipo === 'solicitud' || notif.accion === 'verSolicitud') {
        if (window.usuarioActual.rol === 'admin') {
            document.querySelector('.tab[data-tab="admin"]').click();
            document.querySelector('.sub-tab[data-subtab="sistema"]').click();
            cargarSolicitudesPendientes();
        }
    } else if (notif.tipo === 'ausencia') {
        if (window.usuarioActual.rol === 'admin') {
            document.querySelector('.tab[data-tab="admin"]').click();
            document.querySelector('.sub-tab[data-subtab="ausencias"]').click();
        }
    } else if (notif.tipo === 'licencia') {
        if (window.usuarioActual.rol === 'admin') {
            document.querySelector('.tab[data-tab="admin"]').click();
            document.querySelector('.sub-tab[data-subtab="licencias"]').click();
        }
    }
}

function agregarNotificacion(usuarioId, mensaje, tipo = 'info', accion = null) {
    const notificacion = {
        id: Date.now().toString(),
        usuarioId: usuarioId,
        mensaje: mensaje,
        fecha: Date.now(),
        leida: false,
        tipo: tipo,
        icono: tipo === 'success' ? '✅' : tipo === 'error' ? '⚠️' : tipo === 'recibo' ? '📄' : '🔔',
        accion: accion
    };
    
    if (!window.notificaciones) window.notificaciones = [];
    window.notificaciones.unshift(notificacion);
    guardarTodo();
    
    if (window.usuarioActual && window.usuarioActual.id === usuarioId) {
        cargarNotificaciones();
        const badge = document.getElementById('badgeNotificaciones');
        if (badge) {
            const noLeidas = window.notificaciones.filter(n => !n.leida).length;
            badge.textContent = noLeidas;
            badge.style.display = noLeidas > 0 ? 'flex' : 'none';
        }
    }
}

function marcarNotificacionLeida(id) {
    const notif = window.notificaciones.find(n => n.id === id);
    if (notif && !notif.leida) {
        notif.leida = true;
        guardarTodo();
        cargarNotificaciones();
        
        const badge = document.getElementById('badgeNotificaciones');
        if (badge) {
            const noLeidas = window.notificaciones.filter(n => !n.leida).length;
            badge.textContent = noLeidas;
            badge.style.display = noLeidas > 0 ? 'flex' : 'none';
        }
    }
}

function marcarTodasLeidas() {
    if (!window.notificaciones) return;
    window.notificaciones.forEach(n => n.leida = true);
    guardarTodo();
    cargarNotificaciones();
    
    const badge = document.getElementById('badgeNotificaciones');
    if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
    }
    mostrarNotificacion('Todas las notificaciones marcadas como leídas', 'success');
}

function toggleNotificacionesPanel() {
    const panel = document.getElementById('panelNotificaciones');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            cargarNotificaciones();
        }
    }
}

// ==================== SOLICITUDES PENDIENTES ====================

function cargarSolicitudesPendientes() {
    const container = document.getElementById('listaEdicionesPendientes');
    if (!container) return;
    
    const pendientes = (window.edicionesPendientes || []).filter(p => p.estado === 'pendiente');
    
    if (pendientes.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">✅ No hay solicitudes pendientes</p>';
        return;
    }
    
    container.innerHTML = pendientes.map(solicitud => {
        const empleado = window.usuarios.find(u => u.id === solicitud.usuarioId);
        return `
            <div class="solicitud-item" data-id="${solicitud.id}">
                <div class="solicitud-header">
                    <strong>${escapeHtml(empleado?.nombre || 'Desconocido')}</strong>
                    <span class="solicitud-fecha">${solicitud.fecha}</span>
                </div>
                <div class="solicitud-detalle">
                    <strong>Motivo:</strong> ${escapeHtml(solicitud.motivo)}<br>
                    <strong>Cambio solicitado:</strong> ${escapeHtml(solicitud.detalle || '')}
                </div>
                <div class="solicitud-acciones">
                    <button class="btn btn-success" onclick="aprobarSolicitud('${solicitud.id}')">✅ Aprobar</button>
                    <button class="btn btn-danger" onclick="rechazarSolicitud('${solicitud.id}')">❌ Rechazar</button>
                </div>
            </div>
        `;
    }).join('');
}

function agregarSolicitudCorreccion(usuarioId, fecha, entrada, salida, motivo) {
    const solicitud = {
        id: Date.now().toString(),
        usuarioId: usuarioId,
        tipo: 'correccion',
        fecha: fecha,
        entradaNueva: entrada,
        salidaNueva: salida,
        motivo: motivo,
        detalle: `${entrada ? `Entrada: ${entrada} ` : ''}${salida ? `Salida: ${salida}` : ''}`,
        estado: 'pendiente',
        fechaSolicitud: new Date().toISOString()
    };
    
    if (!window.edicionesPendientes) window.edicionesPendientes = [];
    window.edicionesPendientes.push(solicitud);
    guardarTodo();
    
    agregarNotificacion('admin', `📝 Nueva solicitud de corrección de ${window.usuarioActual.nombre}`, 'solicitud');
    mostrarNotificacion('Solicitud enviada al administrador', 'success');
}

function aprobarSolicitud(id) {
    const solicitud = window.edicionesPendientes.find(s => s.id === id);
    if (!solicitud) return;
    
    solicitud.estado = 'aprobada';
    
    if (solicitud.tipo === 'correccion') {
        const registro = window.registros.find(r => r.usuarioId === solicitud.usuarioId && r.fecha === solicitud.fecha);
        if (registro) {
            if (solicitud.entradaNueva) registro.entrada = solicitud.entradaNueva;
            if (solicitud.salidaNueva) registro.salida = solicitud.salidaNueva;
        } else {
            window.registros.push({
                id: Date.now().toString(),
                usuarioId: solicitud.usuarioId,
                fecha: solicitud.fecha,
                entrada: solicitud.entradaNueva || null,
                salida: solicitud.salidaNueva || null,
                ausente: false
            });
        }
    }
    
    guardarTodo();
    cargarSolicitudesPendientes();
    agregarNotificacion(solicitud.usuarioId, `✅ Tu solicitud de corrección del ${solicitud.fecha} fue aprobada`, 'success');
    mostrarNotificacion('Solicitud aprobada', 'success');
}

function rechazarSolicitud(id) {
    const solicitud = window.edicionesPendientes.find(s => s.id === id);
    if (!solicitud) return;
    
    solicitud.estado = 'rechazada';
    guardarTodo();
    cargarSolicitudesPendientes();
    agregarNotificacion(solicitud.usuarioId, `❌ Tu solicitud de corrección del ${solicitud.fecha} fue rechazada`, 'error');
    mostrarNotificacion('Solicitud rechazada', 'info');
}

// ==================== MODO OSCURO ====================

function toggleModoOscuro() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('btnModoOscuro');
    if (btn) {
        btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function cargarModoOscuro() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('btnModoOscuro');
        if (btn) btn.textContent = '☀️';
    }
}

// Exportar funciones
window.escapeHtml = escapeHtml;
window.verificarPassword = verificarPassword;
window.cargarNotificaciones = cargarNotificaciones;
window.navegarNotificacion = navegarNotificacion;
window.agregarNotificacion = agregarNotificacion;
window.marcarNotificacionLeida = marcarNotificacionLeida;
window.marcarTodasLeidas = marcarTodasLeidas;
window.toggleNotificacionesPanel = toggleNotificacionesPanel;
window.cargarSolicitudesPendientes = cargarSolicitudesPendientes;
window.agregarSolicitudCorreccion = agregarSolicitudCorreccion;
window.aprobarSolicitud = aprobarSolicitud;
window.rechazarSolicitud = rechazarSolicitud;
window.toggleModoOscuro = toggleModoOscuro;
window.cargarModoOscuro = cargarModoOscuro;