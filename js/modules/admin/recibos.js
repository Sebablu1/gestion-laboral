// ==================== ADMIN: RECIBOS ====================

function formatearHoras(horas) {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return `${h}h ${m}m`;
}

function renderRecibosAdmin() {
    const tbody = document.getElementById('tablaRecibos');
    if (!tbody) return;
    if (window.recibos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center"><div class="empty-message">📋 No hay recibos generados</div></td></tr>';
        return;
    }
    tbody.innerHTML = [...window.recibos].reverse().map(r => `
        <tr>
            <td>${r.empleadoNombre}</td>
            <td>${r.periodo}</td>
            <td>${new Date(r.fecha).toLocaleDateString()}</td>
            <td>${window.formatoUY ? window.formatoUY.format(r.neto) : r.neto}</td>
            <td>
                <button class="btn-delete" style="background:#059669" onclick="verRecibo('${r.id}')">📄 Ver</button>
                <button class="btn-delete" onclick="eliminarRecibo('${r.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function eliminarRecibo(id) {
    mostrarConfirmacion('¿Eliminar este recibo?', () => {
        window.recibos = window.recibos.filter(r => r.id !== id);
        guardarTodo();
        renderRecibosAdmin();
        mostrarNotificacion('Recibo eliminado', 'success');
    });
}

function eliminarTodosRecibos() {
    if (window.recibos.length === 0) {
        mostrarNotificacion('No hay recibos para eliminar', 'info');
        return;
    }
    mostrarConfirmacion('¿Eliminar TODOS los recibos? Esta acción no se puede deshacer.', () => {
        window.recibos = [];
        guardarTodo();
        renderRecibosAdmin();
        mostrarNotificacion('Todos los recibos eliminados', 'success');
    }, true);
}

function esFestivoUruguay(fecha) {
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    
    const festivosFijos = [
        { dia: 1, mes: 1 },   // Año Nuevo
        { dia: 6, mes: 1 },   // Día de Reyes
        { dia: 1, mes: 5 },   // Día del Trabajador
        { dia: 18, mes: 7 },  // Jura de la Constitución
        { dia: 25, mes: 8 },  // Día de la Independencia
        { dia: 12, mes: 10 }, // Día de la Raza
        { dia: 2, mes: 11 },  // Día de los Difuntos
        { dia: 25, mes: 12 }  // Navidad
    ];
    
    return festivosFijos.some(f => f.dia === dia && f.mes === mes);
}

function generarReciboAdmin() {
    const empleadoId = document.getElementById('adminSelectEmpleado').value;
    const fechaInicio = document.getElementById('adminFechaInicio').value;
    const fechaFin = document.getElementById('adminFechaFin').value;
    
    if (!empleadoId || !fechaInicio || !fechaFin) {
        mostrarNotificacion('Complete todos los campos', 'error');
        return;
    }
    
    const empleado = window.usuarios.find(u => u.id === empleadoId);
    const puesto = window.puestos.find(p => p.id === empleado?.puestoId);
    
    if (!empleado || !puesto) {
        mostrarNotificacion('Empleado o puesto no encontrado', 'error');
        return;
    }
    
    const registros = window.registros.filter(r => 
        r.usuarioId === empleadoId && 
        r.fecha >= fechaInicio && 
        r.fecha <= fechaFin &&
        r.entrada && r.salida
    );
    
    const jornadaNormalDiaria = window.config.jornadaDiaria || 8;
    const extraPorcentaje = window.config.extraPorcentaje || 50;
    
    let totalHorasNormales = 0;
    let totalHorasExtras50 = 0;
    let totalHorasExtras100 = 0;
    let diasTrabajados = 0;
    let detalleExtras = [];
    
    registros.forEach(reg => {
        const entrada = new Date(`${reg.fecha}T${reg.entrada}`);
        const salida = new Date(`${reg.fecha}T${reg.salida}`);
        let diffHoras = (salida - entrada) / (1000 * 60 * 60);
        diffHoras = Math.round(diffHoras * 2) / 2;
        
        const fecha = new Date(reg.fecha);
        const esDomingo = fecha.getDay() === 0;
        const esFestivo = esFestivoUruguay(fecha);
        
        if (diffHoras > jornadaNormalDiaria) {
            totalHorasNormales += jornadaNormalDiaria;
            const extras = diffHoras - jornadaNormalDiaria;
            
            if (esDomingo || esFestivo) {
                totalHorasExtras100 += extras;
                detalleExtras.push({ fecha: reg.fecha, horas: extras, tipo: '100% (Domingo/Festivo)' });
            } else {
                totalHorasExtras50 += extras;
                detalleExtras.push({ fecha: reg.fecha, horas: extras, tipo: '50%' });
            }
        } else {
            totalHorasNormales += diffHoras;
        }
        diasTrabajados++;
    });
    
    const ausencias = window.ausencias.filter(a => 
        a.usuarioId === empleadoId && 
        a.fecha >= fechaInicio && 
        a.fecha <= fechaFin &&
        a.estado === 'aprobada'
    );
    
    let horasAusencia = 0;
    ausencias.forEach(aus => {
        horasAusencia += aus.horas || 8;
    });
    
    totalHorasNormales = Math.max(0, totalHorasNormales - horasAusencia);
    
    // ✅ CÁLCULO CORREGIDO - Normativa Uruguay (30 días / 240 horas)
    const sueldoMensual = puesto.sueldoMensual;
    const valorDia = sueldoMensual / 30;      // 30 días del mes
    const valorHoraNormal = valorDia / 8;     // 8 horas diarias
    const horasMensuales = 240;               // 30 días × 8 horas
    
    const valorHoraExtra50 = valorHoraNormal * 1.5;   // 50% recargo
    const valorHoraExtra100 = valorHoraNormal * 2;    // 100% recargo
    
    const sueldoProporcional = totalHorasNormales * valorHoraNormal;
    const pagoExtras50 = totalHorasExtras50 * valorHoraExtra50;
    const pagoExtras100 = totalHorasExtras100 * valorHoraExtra100;
    const totalExtras = pagoExtras50 + pagoExtras100;
    
    const añoIngreso = empleado.fechaIngreso ? new Date(empleado.fechaIngreso).getFullYear() : new Date().getFullYear();
    const añoActual = new Date().getFullYear();
    const añosAntiguedad = Math.max(0, añoActual - añoIngreso);
    const porcentajeAntiguedad = Math.min(añosAntiguedad * 1, 20);
    const antiguedad = sueldoProporcional * (porcentajeAntiguedad / 100);
    
    const adicionalesEmpleado = (window.adicionales || []).filter(a => a.empleadoId === empleadoId);
    let totalAdicionales = 0;
    adicionalesEmpleado.forEach(ad => {
        if (ad.tipo === 'fijo') {
            totalAdicionales += parseFloat(ad.valor);
        } else if (ad.tipo === 'porcentaje') {
            totalAdicionales += sueldoProporcional * (parseFloat(ad.valor) / 100);
        }
    });
    
    const totalHaberes = sueldoProporcional + totalExtras + antiguedad + totalAdicionales;
    
    const bpsPorcentaje = window.config.bpsPorcentaje || 15;
    const fonasaPorcentaje = window.config.fonasaPorcentaje || 4.5;
    const irpfPorcentaje = window.config.irpfPorcentaje || 0;
    
    const descuentoBPS = totalHaberes * (bpsPorcentaje / 100);
    const descuentoFONASA = totalHaberes * (fonasaPorcentaje / 100);
    const descuentoIRPF = totalHaberes * (irpfPorcentaje / 100);
    
    const deduccionesGlobales = (window.deducciones || []).filter(d => d.aplicaTodos !== false);
    let totalDeducciones = 0;
    deduccionesGlobales.forEach(ded => {
        if (ded.tipo === 'fijo') {
            totalDeducciones += parseFloat(ded.valor);
        } else if (ded.tipo === 'porcentaje') {
            totalDeducciones += totalHaberes * (parseFloat(ded.valor) / 100);
        }
    });
    
    const descuentoAusencias = horasAusencia * valorHoraNormal;
    const totalDescuentos = descuentoBPS + descuentoFONASA + descuentoIRPF + totalDeducciones + descuentoAusencias;
    const neto = totalHaberes - totalDescuentos;
    
    const recibo = {
        id: Date.now().toString(),
        empleadoId: empleadoId,
        empleadoNombre: empleado.nombre,
        puesto: puesto.nombre,
        area: puesto.area,
        periodo: `${fechaInicio} al ${fechaFin}`,
        fecha: new Date().toISOString(),
        sueldoMensual: sueldoMensual,
        horasMensuales: horasMensuales,
        jornadaNormalDiaria: jornadaNormalDiaria,
        diasTrabajados: diasTrabajados,
        horasNormales: totalHorasNormales,
        horasExtras50: totalHorasExtras50,
        horasExtras100: totalHorasExtras100,
        valorHoraNormal: valorHoraNormal,
        valorHoraExtra50: valorHoraExtra50,
        valorHoraExtra100: valorHoraExtra100,
        sueldoProporcional: sueldoProporcional,
        pagoExtras50: pagoExtras50,
        pagoExtras100: pagoExtras100,
        totalExtras: totalExtras,
        antiguedad: antiguedad,
        añosAntiguedad: añosAntiguedad,
        porcentajeAntiguedad: porcentajeAntiguedad,
        adicionales: adicionalesEmpleado,
        totalAdicionales: totalAdicionales,
        totalHaberes: totalHaberes,
        descuentoBPS: descuentoBPS,
        descuentoFONASA: descuentoFONASA,
        descuentoIRPF: descuentoIRPF,
        deducciones: deduccionesGlobales,
        totalDeducciones: totalDeducciones,
        descuentoAusencias: descuentoAusencias,
        horasAusencia: horasAusencia,
        totalDescuentos: totalDescuentos,
        neto: neto,
        ausencias: ausencias.map(a => ({ fecha: a.fecha, tipo: a.tipo, horas: a.horas })),
        detalleExtras: detalleExtras,
        config: { ...window.config }
    };
    
    window.recibos.push(recibo);
    guardarTodo();
    
    mostrarNotificacion(`Recibo generado para ${empleado.nombre}`, 'success');
    renderRecibosAdmin();
    mostrarResumenRecibo(recibo);
}

function mostrarResumenRecibo(recibo) {
    const formatoUY = window.formatoUY || new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' });
    
    let resumenHtml = `
        <div class="recibo-preview">
            <h3>📄 Resumen de Liquidación</h3>
            <div class="recibo-empleado">
                <strong>${recibo.empleadoNombre}</strong> - ${recibo.puesto} (${recibo.area})
            </div>
            <div class="recibo-periodo">Período: ${recibo.periodo}</div>
            <div class="recibo-horas">Horas trabajadas: ${formatearHoras(recibo.horasNormales + recibo.horasExtras50 + recibo.horasExtras100)} | Ausencias: ${formatearHoras(recibo.horasAusencia)}</div>
            <table class="recibo-tabla">
                <tr><th>Concepto</th><th>Haberes</th><th>Descuentos</th></tr>
                <tr><td>Sueldo Base Mensual</td><td>${formatoUY.format(recibo.sueldoMensual)}</td><td>-</td></tr>
                <tr><td>Sueldo Proporcional (${formatearHoras(recibo.horasNormales)}h)</td><td>${formatoUY.format(recibo.sueldoProporcional)}</td><td>-</td></tr>`;
    
    if (recibo.horasExtras50 > 0) {
        resumenHtml += `<tr><td>⭐ Horas Extras 50% (${formatearHoras(recibo.horasExtras50)}h)</td><td>${formatoUY.format(recibo.pagoExtras50)}</td><td>-</td></tr>`;
    }
    
    if (recibo.horasExtras100 > 0) {
        resumenHtml += `<tr><td>⭐⭐ Horas Extras 100% (${formatearHoras(recibo.horasExtras100)}h)</td><td>${formatoUY.format(recibo.pagoExtras100)}</td><td>-</td></tr>`;
    }
    
    if (recibo.antiguedad > 0) {
        resumenHtml += `<tr><td>🎁 Antigüedad (${recibo.añosAntiguedad} años - ${recibo.porcentajeAntiguedad}%)</td><td>${formatoUY.format(recibo.antiguedad)}</td><td>-</td></tr>`;
    }
    
    resumenHtml += `
                <tr style="border-top:2px solid #ddd;"><td><strong>Total Haberes</strong></td><td><strong>${formatoUY.format(recibo.totalHaberes)}</strong></td><td>-</td></tr>
                <tr><td>BPS (${recibo.config.bpsPorcentaje}%)</td><td>-</td><td>${formatoUY.format(recibo.descuentoBPS)}</td></tr>
                <tr><td>FONASA (${recibo.config.fonasaPorcentaje}%)</td><td>-</td><td>${formatoUY.format(recibo.descuentoFONASA)}</td></tr>`;
    
    if (recibo.descuentoIRPF > 0) {
        resumenHtml += `<tr><td>IRPF (${recibo.config.irpfPorcentaje}%)</td><td>-</td><td>${formatoUY.format(recibo.descuentoIRPF)}</td></tr>`;
    }
    
    if (recibo.descuentoAusencias > 0) {
        resumenHtml += `<tr><td>⚠️ Ausencias (${formatearHoras(recibo.horasAusencia)}h)</td><td>-</td><td>${formatoUY.format(recibo.descuentoAusencias)}</td></tr>`;
    }
    
    resumenHtml += `
                <tr style="border-top:2px solid #ddd;"><td><strong>Total Descuentos</strong></td><td>-</td><td><strong>${formatoUY.format(recibo.totalDescuentos)}</strong></td></tr>
                <tr class="recibo-total"><td><strong>NETO A COBRAR</strong></td><td colspan="2"><strong>${formatoUY.format(recibo.neto)}</strong></td></tr>
            </table>
        </div>
    `;
    
    const container = document.getElementById('empleadoReciboContainer');
    if (container) {
        container.innerHTML = resumenHtml;
    } else {
        mostrarNotificacion(`Neto a cobrar: ${formatoUY.format(recibo.neto)}`, 'success');
    }
}

function verRecibo(id) {
    const recibo = window.recibos.find(r => r.id === id);
    if (!recibo) return;
    const empleado = window.usuarios.find(u => u.id === recibo.empleadoId);
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Recibo ${recibo.empleadoNombre}</title>
            <style>
                body { font-family: monospace; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px; }
                .empresa-nombre { font-size: 24px; font-weight: bold; }
                .recibo-titulo { font-size: 18px; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f5f5f5; }
                .total-box { text-align: center; background: #e8f5e9; padding: 20px; margin: 20px 0; border-radius: 10px; }
                .total-box h3 { margin: 0; color: #059669; }
                .total-box p { font-size: 28px; font-weight: bold; margin: 10px 0 0; }
                .firmas { display: flex; justify-content: space-between; margin-top: 40px; }
                .firmas div { text-align: center; }
                button { margin-bottom: 20px; padding: 10px 20px; cursor: pointer; background: #059669; color: white; border: none; border-radius: 5px; }
                button:hover { background: #047857; }
                @media print { button { display: none; } }
                .extras-detalle { font-size: 12px; color: #666; margin-top: 5px; }
            </style>
        </head>
        <body>
            <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
            <div class="header">
                <div class="empresa-nombre">${window.empresa.logo} ${window.empresa.nombre}</div>
                <p>RUT: ${window.empresa.rut} | ${window.empresa.direccion}</p>
                <div class="recibo-titulo"><strong>RECIBO DE SUELDO</strong></div>
                <p><strong>Período:</strong> ${recibo.periodo}</p>
                <p><strong>Empleado:</strong> ${recibo.empleadoNombre}</p>
                <p><strong>Puesto:</strong> ${recibo.puesto} (${recibo.area})</p>
                <p><strong>📅 Año de Ingreso:</strong> ${empleado?.fechaIngreso ? new Date(empleado.fechaIngreso).getFullYear() : 'No registrado'} (${recibo.añosAntiguedad} años)</p>
            </div>
            
            <table>
                <thead><tr><th>Concepto</th><th>Haberes</th><th>Descuentos</th></tr></thead>
                <tbody>
                    <tr><td>Sueldo Base Mensual</td><td style="text-align:right;">${window.formatoUY.format(recibo.sueldoMensual)}</td><td style="text-align:right;">-</td></tr>
                    <tr><td>Sueldo Proporcional (${formatearHoras(recibo.horasNormales)}h)</td><td style="text-align:right;">${window.formatoUY.format(recibo.sueldoProporcional)}</td><td style="text-align:right;">-</td></tr>
                    ${recibo.horasExtras50 > 0 ? `<tr><td>⭐ Horas Extras 50% (${formatearHoras(recibo.horasExtras50)}h)</td><td style="text-align:right;">${window.formatoUY.format(recibo.pagoExtras50)}</td><td style="text-align:right;">-</td></tr>` : ''}
                    ${recibo.horasExtras100 > 0 ? `<tr><td>⭐⭐ Horas Extras 100% (${formatearHoras(recibo.horasExtras100)}h)</td><td style="text-align:right;">${window.formatoUY.format(recibo.pagoExtras100)}</td><td style="text-align:right;">-</td></tr>` : ''}
                    ${recibo.antiguedad > 0 ? `<tr><td>🎁 Antigüedad (${recibo.añosAntiguedad} años - ${recibo.porcentajeAntiguedad}%)</td><td style="text-align:right;">${window.formatoUY.format(recibo.antiguedad)}</td><td style="text-align:right;">-</td></tr>` : ''}
                    <tr style="border-top:2px solid #ddd;"><td><strong>Total Haberes</strong></td><td style="text-align:right;"><strong>${window.formatoUY.format(recibo.totalHaberes)}</strong></td><td style="text-align:right;">-</td></tr>
                    <tr><td>BPS (${recibo.config.bpsPorcentaje}%)</td><td style="text-align:right;">-</td><td style="text-align:right;">${window.formatoUY.format(recibo.descuentoBPS)}</td></tr>
                    <tr><td>FONASA (${recibo.config.fonasaPorcentaje}%)</td><td style="text-align:right;">-</td><td style="text-align:right;">${window.formatoUY.format(recibo.descuentoFONASA)}</td></tr>
                    ${recibo.descuentoIRPF > 0 ? `<tr><td>IRPF (${recibo.config.irpfPorcentaje}%)</td><td style="text-align:right;">-</td><td style="text-align:right;">${window.formatoUY.format(recibo.descuentoIRPF)}</td></tr>` : ''}
                    ${recibo.descuentoAusencias > 0 ? `<tr><td>⚠️ Ausencias (${formatearHoras(recibo.horasAusencia)}h)</td><td style="text-align:right;">-</td><td style="text-align:right;">${window.formatoUY.format(recibo.descuentoAusencias)}</td></tr>` : ''}
                    <tr style="border-top:2px solid #ddd;"><td><strong>Total Descuentos</strong></td><td style="text-align:right;">-</td><td style="text-align:right;"><strong>${window.formatoUY.format(recibo.totalDescuentos)}</strong></td></tr>
                </tbody>
            </table>
            
            ${recibo.detalleExtras && recibo.detalleExtras.length > 0 ? `
            <div class="extras-detalle">
                <strong>📋 Detalle de horas extras:</strong><br>
                ${recibo.detalleExtras.map(e => `${e.fecha}: ${formatearHoras(e.horas)} (${e.tipo})`).join('<br>')}
            </div>
            ` : ''}
            
            <div class="total-box">
                <h3>Total Neto a Cobrar</h3>
                <p>${window.formatoUY.format(recibo.neto)}</p>
            </div>
            
            <div class="firmas">
                <div>_________________<br>Firma Empleador</div>
                <div>_________________<br>Firma Empleado</div>
            </div>
        </body>
        </html>
    `);
    ventana.document.close();
}

window.renderRecibosAdmin = renderRecibosAdmin;
window.generarReciboAdmin = generarReciboAdmin;
window.eliminarRecibo = eliminarRecibo;
window.eliminarTodosRecibos = eliminarTodosRecibos;
window.verRecibo = verRecibo;