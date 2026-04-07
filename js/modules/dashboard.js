// ==================== DASHBOARD ====================

function renderDashboard() {
    // Actualizar tarjetas de estadísticas
    const totalEmpleados = window.usuarios.filter(u => u.rol === 'empleado').length;
    const hoy = new Date().toISOString().split('T')[0];
    const presentes = window.registros.filter(r => r.fecha === hoy && r.entrada && !r.ausente).length;
    const ausentes = window.ausencias.filter(a => a.fecha === hoy && a.estado === 'aprobada').length;
    
    // Crear tarjetas si no existen
    let statsContainer = document.getElementById('dashboardStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-title">Total Empleados</div>
                <div class="stat-number">${totalEmpleados}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Presentes Hoy</div>
                <div class="stat-number">${presentes}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Ausentes Hoy</div>
                <div class="stat-number">${ausentes}</div>
            </div>
        `;
    }
    
    // 📊 Gráfico: Empleados por Área
    const areasMap = {};
    
    // Inicializar mapa de áreas
    window.areas.forEach(area => {
        areasMap[area.nombre] = 0;
    });
    
    // Contar empleados por área (obteniendo el área desde el puesto)
    window.usuarios.forEach(user => {
        if (user.rol === 'empleado' && user.puestoId) {
            const puesto = window.puestos.find(p => p.id === user.puestoId);
            if (puesto && puesto.area) {
                areasMap[puesto.area] = (areasMap[puesto.area] || 0) + 1;
            }
        }
    });
    
    const labels = Object.keys(areasMap);
    const data = Object.values(areasMap);
    
    const ctx = document.getElementById('horasPorAreaChart');
    if (ctx) {
        // Destruir gráfico anterior si existe
        if (window.areaChart) {
            window.areaChart.destroy();
        }
        
        if (labels.length === 0) {
            const parent = ctx.parentNode;
            let noDataMsg = parent.querySelector('.no-data-message');
            if (!noDataMsg) {
                noDataMsg = document.createElement('div');
                noDataMsg.className = 'no-data-message';
                noDataMsg.style.textAlign = 'center';
                noDataMsg.style.padding = '40px';
                noDataMsg.style.color = '#666';
                noDataMsg.innerHTML = '📊 No hay áreas o empleados cargados<br><small>Agregue áreas y empleados en el Panel Admin</small>';
                parent.appendChild(noDataMsg);
            }
            ctx.style.display = 'none';
        } else {
            const parent = ctx.parentNode;
            const noDataMsg = parent.querySelector('.no-data-message');
            if (noDataMsg) noDataMsg.remove();
            ctx.style.display = 'block';
            
            window.areaChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Cantidad de empleados',
                        data: data,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            stepSize: 1,
                            title: { display: true, text: 'Empleados' }
                        },
                        x: {
                            title: { display: true, text: 'Áreas' }
                        }
                    }
                }
            });
        }
    }
    
    // ⚠️ Últimas Ausencias
    const ausenciasList = document.getElementById('ultimasAusencias');
    if (ausenciasList) {
        ausenciasList.innerHTML = '';
        const ausenciasRecientes = [...window.ausencias]
            .filter(a => a.estado === 'aprobada')
            .sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);
        
        if (ausenciasRecientes.length === 0) {
            ausenciasList.innerHTML = '<p style="color: #4CAF50;">✅ No hay ausencias recientes</p>';
        } else {
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            ausenciasRecientes.forEach(aus => {
                const usuario = window.usuarios.find(u => u.id === aus.usuarioId);
                const nombre = usuario ? usuario.nombre : 'Desconocido';
                const li = document.createElement('li');
                li.style.padding = '8px 0';
                li.style.borderBottom = '1px solid #eee';
                li.innerHTML = `⚠️ ${nombre} - ${aus.tipo} (${aus.fecha})`;
                ul.appendChild(li);
            });
            ausenciasList.appendChild(ul);
        }
    }
    
    // 🏖️ Próximas Licencias
    const licenciasList = document.getElementById('proximasLicencias');
    if (licenciasList) {
        licenciasList.innerHTML = '';
        const hoyDate = new Date();
        const proximas = [...window.licencias]
            .filter(l => l.estado === 'aprobada' && new Date(l.fechaInicio) >= hoyDate)
            .sort((a,b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
            .slice(0, 5);
        
        if (proximas.length === 0) {
            licenciasList.innerHTML = '<p style="color: #666;">🏖️ Sin licencias programadas</p>';
        } else {
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            proximas.forEach(lic => {
                const usuario = window.usuarios.find(u => u.id === lic.usuarioId);
                const nombre = usuario ? usuario.nombre : 'Desconocido';
                const li = document.createElement('li');
                li.style.padding = '8px 0';
                li.style.borderBottom = '1px solid #eee';
                li.innerHTML = `🏖️ ${nombre} - ${lic.tipo} (${lic.fechaInicio} al ${lic.fechaFin})`;
                ul.appendChild(li);
            });
            licenciasList.appendChild(ul);
        }
    }
}

// Exportar función
window.renderDashboard = renderDashboard;