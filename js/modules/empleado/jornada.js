// ==================== EMPLEADO: JORNADA ====================
function renderMiJornada() {
    const hoy = new Date().toISOString().split('T')[0];
    const registro = window.registros.find(r => r.usuarioId === window.usuarioActual.id && r.fecha === hoy);
    const estado = document.getElementById('estadoFichaje');
    
    if (registro?.entrada && !registro?.salida) {
        const horas = calcularHorasTranscurridas(registro.entrada);
        estado.innerHTML = `<div class="estado-activo">⏱️ Jornada activa - Entrada: ${registro.entrada} - ${formatearHoras(horas)}</div>`;
        iniciarTemporizadorJornada(registro.entrada);
    } else if (registro?.entrada && registro?.salida) {
        const horas = calcularHorasProfesional(registro.entrada, registro.salida);
        estado.innerHTML = `<div class="estado-inactivo">✅ Jornada completada - ${formatearHoras(horas)}</div>`;
    } else {
        estado.innerHTML = `<div class="estado-inactivo">⏳ No has fichado hoy</div>`;
    }
}

function iniciarTemporizadorJornada(entrada) {
    if (window.temporizadorJornada) clearInterval(window.temporizadorJornada);
    window.temporizadorJornada = setInterval(() => {
        const horas = calcularHorasTranscurridas(entrada);
        const estadoDiv = document.getElementById('estadoFichaje');
        if (estadoDiv && estadoDiv.innerHTML.includes('activa')) {
            estadoDiv.innerHTML = `<div class="estado-activo">⏱️ Jornada activa - Entrada: ${entrada} - ${formatearHoras(horas)}</div>`;
        }
    }, 60000);
}

function ficharEntrada() {
    const hoy = new Date().toISOString().split('T')[0];
    if (window.mesesCerrados.some(m => hoy.startsWith(m))) {
        mostrarNotificacion('Mes cerrado, no se puede fichar', 'error');
        return;
    }
    
    const existe = window.registros.find(r => r.usuarioId === window.usuarioActual.id && r.fecha === hoy);
    if (existe?.entrada) {
        mostrarNotificacion('Ya has fichado entrada', 'warning');
        return;
    }
    
    const hora = new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (existe) {
        existe.entrada = hora;
    } else {
        window.registros.push({ id: Date.now().toString(), usuarioId: window.usuarioActual.id, fecha: hoy, entrada: hora, salida: null });
    }
    guardarTodo();
    renderMiJornada();
    renderMisRegistros();
    mostrarNotificacion(`✅ Entrada a las ${hora}`, 'success');
}

function ficharSalida() {
    const hoy = new Date().toISOString().split('T')[0];
    if (window.mesesCerrados.some(m => hoy.startsWith(m))) {
        mostrarNotificacion('Mes cerrado, no se puede fichar', 'error');
        return;
    }
    
    const registro = window.registros.find(r => r.usuarioId === window.usuarioActual.id && r.fecha === hoy);
    if (!registro?.entrada) {
        mostrarNotificacion('Primero debes fichar entrada', 'error');
        return;
    }
    if (registro.salida) {
        mostrarNotificacion('Ya has fichado salida', 'warning');
        return;
    }
    
    const hora = new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false });
    registro.salida = hora;
    guardarTodo();
    if (window.temporizadorJornada) clearInterval(window.temporizadorJornada);
    renderMiJornada();
    renderMisRegistros();
    const horas = calcularHorasProfesional(registro.entrada, hora);
    mostrarNotificacion(`✅ Salida a las ${hora} - Total: ${formatearHoras(horas)}`, 'success');
}