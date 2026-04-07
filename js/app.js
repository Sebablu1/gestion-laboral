// ==================== APP PRINCIPAL ====================
// Variables globales
window.usuarios = [];
window.registros = [];
window.recibos = [];
window.deducciones = [];
window.adicionales = [];
window.ausencias = [];
window.licencias = [];
window.auditoria = [];
window.mesesCerrados = [];
window.edicionesPendientes = [];
window.notificaciones = [];
window.areas = [];
window.puestos = [];
window.config = {};
window.empresa = {};
window.usuarioActual = null;
window.temporizadorJornada = null;

function mostrarMain() {
    console.log('mostrarMain ejecutado');
    
    document.getElementById('loginPanel')?.classList.add('hidden');
    document.getElementById('mainContent')?.classList.remove('hidden');

    // Actualizar header
    const empresaNombreEl = document.getElementById('empresaNombre');
    const empresaRutEl = document.getElementById('empresaRut');
    const empresaLogoEl = document.getElementById('empresaLogo');
    const userInfoHeader = document.getElementById('userInfoHeader');
    
    if (empresaNombreEl) empresaNombreEl.innerHTML = `${window.empresa.logo} ${window.empresa.nombre}`;
    if (empresaRutEl) empresaRutEl.innerHTML = window.empresa.rut;
    if (empresaLogoEl) empresaLogoEl.innerHTML = window.empresa.logo;
    if (userInfoHeader) {
        userInfoHeader.innerHTML = `
            <span>👤 ${window.usuarioActual.rol === 'admin' ? 'Administrador' : window.usuarioActual.nombre}</span>
            <button class="logout-btn" onclick="cerrarSesion()">🚪 Salir</button>
        `;
    }

    const tabsContainer = document.getElementById('tabsContainer');
    const adminPanel = document.getElementById('adminPanel');
    const empleadoPanel = document.getElementById('empleadoPanel');
    const dashboardPanel = document.getElementById('dashboardPanel');

    if (window.usuarioActual.rol === 'admin') {
        if (tabsContainer) tabsContainer.innerHTML = `<div class="tab active" data-tab="dashboard">📊 Dashboard</div><div class="tab" data-tab="admin">👑 Panel Admin</div>`;
        if (dashboardPanel) dashboardPanel.classList.add('active');
        if (adminPanel) adminPanel.classList.remove('active');
        if (empleadoPanel) empleadoPanel.classList.remove('active');
        
        // Renderizar todo
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderAreas === 'function') renderAreas();
        if (typeof renderPuestos === 'function') renderPuestos();
        if (typeof renderUsuariosAdmin === 'function') renderUsuariosAdmin();
        if (typeof renderRecibosAdmin === 'function') renderRecibosAdmin();
        if (typeof renderDeduccionesAdmin === 'function') renderDeduccionesAdmin();
        if (typeof renderAusenciasAdmin === 'function') renderAusenciasAdmin();
        if (typeof renderLicenciasAdmin === 'function') renderLicenciasAdmin();
        if (typeof renderAdicionalesAdmin === 'function') renderAdicionalesAdmin();
        if (typeof renderAuditoria === 'function') renderAuditoria();
        if (typeof renderMesesCerrados === 'function') renderMesesCerrados();
        if (typeof cargarNotificaciones === 'function') cargarNotificaciones();
        if (typeof actualizarSelectsGlobal === 'function') actualizarSelectsGlobal();
        if (typeof cargarSolicitudesPendientes === 'function') cargarSolicitudesPendientes();
        
        // Configurar inputs por defecto
        const mesCierre = document.getElementById('mesCierre');
        if (mesCierre) mesCierre.value = new Date().toISOString().slice(0, 7);
        
        const adminFechaInicio = document.getElementById('adminFechaInicio');
        const adminFechaFin = document.getElementById('adminFechaFin');
        if (adminFechaInicio) adminFechaInicio.value = new Date().toISOString().split('T')[0];
        if (adminFechaFin) adminFechaFin.value = new Date().toISOString().split('T')[0];
        
        const empresaNombreInput = document.getElementById('empresaNombreInput');
        const empresaRutInput = document.getElementById('empresaRutInput');
        const empresaDirInput = document.getElementById('empresaDirInput');
        const empresaLogoInput = document.getElementById('empresaLogoInput');
        if (empresaNombreInput) empresaNombreInput.value = window.empresa.nombre;
        if (empresaRutInput) empresaRutInput.value = window.empresa.rut;
        if (empresaDirInput) empresaDirInput.value = window.empresa.direccion;
        if (empresaLogoInput) empresaLogoInput.value = window.empresa.logo;
        
        const extraPorcentaje = document.getElementById('extraPorcentaje');
        const bpsPorcentaje = document.getElementById('bpsPorcentaje');
        const fonasaPorcentaje = document.getElementById('fonasaPorcentaje');
        const irpfPorcentaje = document.getElementById('irpfPorcentaje');
        const jornadaDiaria = document.getElementById('jornadaDiaria');
        if (extraPorcentaje) extraPorcentaje.value = window.config.extraPorcentaje;
        if (bpsPorcentaje) bpsPorcentaje.value = window.config.bpsPorcentaje;
        if (fonasaPorcentaje) fonasaPorcentaje.value = window.config.fonasaPorcentaje;
        if (irpfPorcentaje) irpfPorcentaje.value = window.config.irpfPorcentaje;
        if (jornadaDiaria) jornadaDiaria.value = window.config.jornadaDiaria;
        
    } else {
        if (tabsContainer) tabsContainer.innerHTML = `<div class="tab active" data-tab="empleado">⏱️ Mi Jornada</div>`;
        if (empleadoPanel) empleadoPanel.classList.add('active');
        if (dashboardPanel) dashboardPanel.classList.remove('active');
        if (adminPanel) adminPanel.classList.remove('active');
        
        const filtroMesEmpleado = document.getElementById('filtroMesEmpleado');
        if (filtroMesEmpleado) filtroMesEmpleado.value = new Date().toISOString().slice(0, 7);
        
        if (typeof renderMiJornada === 'function') renderMiJornada();
        if (typeof renderMisRegistros === 'function') renderMisRegistros();
        if (typeof renderMisRecibos === 'function') renderMisRecibos();
        
        const hoy = new Date().toISOString().split('T')[0];
        const registroHoy = window.registros.find(r => r.usuarioId === window.usuarioActual.id && r.fecha === hoy);
        if (registroHoy && registroHoy.entrada && !registroHoy.salida) {
            if (typeof iniciarTemporizadorJornada === 'function') iniciarTemporizadorJornada(registroHoy.entrada);
        }
    }

    // Eventos de tabs principales
    document.querySelectorAll('.tab').forEach(tab => {
        tab.onclick = () => {
            const tabId = tab.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`${tabId}Panel`);
            if (panel) panel.classList.add('active');
            
            if (tabId === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
            if (tabId === 'admin') {
                if (typeof actualizarSelectsGlobal === 'function') actualizarSelectsGlobal();
                if (typeof renderUsuariosAdmin === 'function') renderUsuariosAdmin();
                if (typeof renderRecibosAdmin === 'function') renderRecibosAdmin();
                if (typeof renderAuditoria === 'function') renderAuditoria();
                if (typeof renderAreas === 'function') renderAreas();
                if (typeof renderPuestos === 'function') renderPuestos();
                if (typeof renderAusenciasAdmin === 'function') renderAusenciasAdmin();
                if (typeof renderLicenciasAdmin === 'function') renderLicenciasAdmin();
                if (typeof renderDeduccionesAdmin === 'function') renderDeduccionesAdmin();
                if (typeof renderAdicionalesAdmin === 'function') renderAdicionalesAdmin();
                if (typeof renderMesesCerrados === 'function') renderMesesCerrados();
                if (typeof cargarSolicitudesPendientes === 'function') cargarSolicitudesPendientes();
            }
            if (tabId === 'empleado') {
                if (typeof renderMiJornada === 'function') renderMiJornada();
                if (typeof renderMisRegistros === 'function') renderMisRegistros();
            }
        };
    });

    // Eventos de sub-tabs
    document.querySelectorAll('.sub-tab').forEach(subtab => {
        subtab.onclick = () => {
            const subtabId = subtab.dataset.subtab;
            document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            subtab.classList.add('active');
            document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
            const content = document.getElementById(`subtab-${subtabId}`);
            if (content) content.classList.add('active');
            
            if (subtabId === 'usuarios' && typeof renderUsuariosAdmin === 'function') renderUsuariosAdmin();
            if (subtabId === 'finanzas' && typeof renderRecibosAdmin === 'function') renderRecibosAdmin();
            if (subtabId === 'sistema' && typeof renderAuditoria === 'function') renderAuditoria();
            if (subtabId === 'areas' && typeof renderAreas === 'function') renderAreas();
            if (subtabId === 'puestos' && typeof renderPuestos === 'function') renderPuestos();
            if (subtabId === 'ausencias' && typeof renderAusenciasAdmin === 'function') renderAusenciasAdmin();
            if (subtabId === 'licencias' && typeof renderLicenciasAdmin === 'function') renderLicenciasAdmin();
            if (subtabId === 'finanzas') {
                if (typeof renderDeduccionesAdmin === 'function') renderDeduccionesAdmin();
                if (typeof renderAdicionalesAdmin === 'function') renderAdicionalesAdmin();
            }
            if (subtabId === 'sistema') {
                if (typeof renderMesesCerrados === 'function') renderMesesCerrados();
                if (typeof renderAuditoria === 'function') renderAuditoria();
                if (typeof cargarSolicitudesPendientes === 'function') cargarSolicitudesPendientes();
            }
        };
    });
}

function init() {
    console.log('Iniciando aplicación...');
    
    // Cargar datos
    if (typeof cargarDatos === 'function') {
        cargarDatos();
    } else {
        console.error('cargarDatos no está definida');
    }
    
    if (typeof inicializarDatosPorDefecto === 'function') {
        inicializarDatosPorDefecto();
    }
    
    // Event listeners
    const formLogin = document.getElementById('formLogin');
    if (formLogin) formLogin.addEventListener('submit', doLogin);
    
    const btnModoOscuro = document.getElementById('btnModoOscuro');
    if (btnModoOscuro) btnModoOscuro.addEventListener('click', toggleModoOscuro);
    
    const btnGuardarEmpresa = document.getElementById('btnGuardarEmpresa');
    if (btnGuardarEmpresa) btnGuardarEmpresa.addEventListener('click', guardarEmpresa);
    
    const btnGuardarConfig = document.getElementById('btnGuardarConfig');
    if (btnGuardarConfig) btnGuardarConfig.addEventListener('click', guardarConfiguracion);
    
    const btnAgregarArea = document.getElementById('btnAgregarArea');
    if (btnAgregarArea) btnAgregarArea.addEventListener('click', agregarArea);
    
    const btnAgregarPuesto = document.getElementById('btnAgregarPuesto');
    if (btnAgregarPuesto) btnAgregarPuesto.addEventListener('click', agregarPuesto);
    
    const btnCrearUsuario = document.getElementById('btnCrearUsuario');
    if (btnCrearUsuario) btnCrearUsuario.addEventListener('click', crearUsuario);
    
    const btnAgregarDed = document.getElementById('btnAgregarDed');
    if (btnAgregarDed) btnAgregarDed.addEventListener('click', agregarDeduccion);
    
    const btnAgregarAdicional = document.getElementById('btnAgregarAdicional');
    if (btnAgregarAdicional) btnAgregarAdicional.addEventListener('click', agregarAdicional);
    
    const btnRegistrarAusencia = document.getElementById('btnRegistrarAusencia');
    if (btnRegistrarAusencia) btnRegistrarAusencia.addEventListener('click', registrarAusencia);
    
    const btnSolicitarLicencia = document.getElementById('btnSolicitarLicencia');
    if (btnSolicitarLicencia) btnSolicitarLicencia.addEventListener('click', solicitarLicencia);
    
    const btnCerrarMes = document.getElementById('btnCerrarMes');
    if (btnCerrarMes) btnCerrarMes.addEventListener('click', cerrarMes);
    
    const btnGenerarRecibo = document.getElementById('btnGenerarRecibo');
    if (btnGenerarRecibo) btnGenerarRecibo.addEventListener('click', generarReciboAdmin);
    
    const btnEliminarTodosRecibos = document.getElementById('btnEliminarTodosRecibos');
    if (btnEliminarTodosRecibos) btnEliminarTodosRecibos.addEventListener('click', eliminarTodosRecibos);
    
    const btnCambiarPassAdmin = document.getElementById('btnCambiarPassAdmin');
    if (btnCambiarPassAdmin) btnCambiarPassAdmin.addEventListener('click', cambiarPasswordAdmin);
    
    const btnEntrada = document.getElementById('btnEntrada');
    if (btnEntrada) btnEntrada.addEventListener('click', ficharEntrada);
    
    const btnSalida = document.getElementById('btnSalida');
    if (btnSalida) btnSalida.addEventListener('click', ficharSalida);
    
    const btnCorregirRegistro = document.getElementById('btnCorregirRegistro');
    if (btnCorregirRegistro) btnCorregirRegistro.addEventListener('click', solicitarCorreccion);
    
    const btnFiltrarRegistros = document.getElementById('btnFiltrarRegistros');
    if (btnFiltrarRegistros) btnFiltrarRegistros.addEventListener('click', renderMisRegistros);
    
    const btnGenerarMiRecibo = document.getElementById('btnGenerarMiRecibo');
    if (btnGenerarMiRecibo) btnGenerarMiRecibo.addEventListener('click', generarMiRecibo);
    
    const btnCambiarPass = document.getElementById('btnCambiarPass');
    if (btnCambiarPass) btnCambiarPass.addEventListener('click', cambiarPassword);
    
    const btnNotificaciones = document.getElementById('btnNotificaciones');
    if (btnNotificaciones) btnNotificaciones.addEventListener('click', toggleNotificacionesPanel);
    
    const btnMarcarTodasLeidas = document.getElementById('btnMarcarTodasLeidas');
    if (btnMarcarTodasLeidas) btnMarcarTodasLeidas.addEventListener('click', marcarTodasLeidas);

    // Mostrar login
    if (typeof mostrarLogin === 'function') {
        mostrarLogin();
    } else {
        console.error('mostrarLogin no está definida');
    }
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==================== EXPORTAR FUNCIONES GLOBALES ====================
// Esto asegura que todas las funciones estén disponibles globalmente

// Funciones de Auth
window.doLogin = doLogin;
window.cerrarSesion = cerrarSesion;
window.mostrarLogin = mostrarLogin;

// Funciones de Dashboard
window.renderDashboard = renderDashboard;

// Funciones de Admin - Areas
window.renderAreas = renderAreas;
window.agregarArea = agregarArea;
window.eliminarArea = eliminarArea;

// Funciones de Admin - Puestos
window.renderPuestos = renderPuestos;
window.agregarPuesto = agregarPuesto;
window.eliminarPuesto = eliminarPuesto;

// Funciones de Admin - Usuarios
window.renderUsuariosAdmin = renderUsuariosAdmin;
window.crearUsuario = crearUsuario;
window.eliminarUsuario = eliminarUsuario;

// Funciones de Admin - Ausencias
window.renderAusenciasAdmin = renderAusenciasAdmin;
window.registrarAusencia = registrarAusencia;

// Funciones de Admin - Licencias
window.renderLicenciasAdmin = renderLicenciasAdmin;
window.solicitarLicencia = solicitarLicencia;

// Funciones de Admin - Deducciones
window.renderDeduccionesAdmin = renderDeduccionesAdmin;
window.agregarDeduccion = agregarDeduccion;

// Funciones de Admin - Adicionales
window.renderAdicionalesAdmin = renderAdicionalesAdmin;
window.agregarAdicional = agregarAdicional;

// Funciones de Admin - Recibos
window.renderRecibosAdmin = renderRecibosAdmin;
window.generarReciboAdmin = generarReciboAdmin;
window.eliminarTodosRecibos = eliminarTodosRecibos;

// Funciones de Admin - Meses
window.renderMesesCerrados = renderMesesCerrados;
window.cerrarMes = cerrarMes;

// Funciones de Admin - Auditoria
window.renderAuditoria = renderAuditoria;

// Funciones de Admin - Config
window.guardarEmpresa = guardarEmpresa;
window.guardarConfiguracion = guardarConfiguracion;
window.cambiarPasswordAdmin = cambiarPasswordAdmin;

// Funciones de Empleado
window.renderMiJornada = renderMiJornada;
window.renderMisRegistros = renderMisRegistros;
window.renderMisRecibos = renderMisRecibos;
window.ficharEntrada = ficharEntrada;
window.ficharSalida = ficharSalida;
window.solicitarCorreccion = solicitarCorreccion;
window.generarMiRecibo = generarMiRecibo;
window.cambiarPassword = cambiarPassword;

// Funciones de UI
window.toggleModoOscuro = toggleModoOscuro;
window.toggleNotificacionesPanel = toggleNotificacionesPanel;
window.marcarTodasLeidas = marcarTodasLeidas;
window.cargarNotificaciones = cargarNotificaciones;
window.cargarSolicitudesPendientes = cargarSolicitudesPendientes;
window.aprobarSolicitud = aprobarSolicitud;
window.rechazarSolicitud = rechazarSolicitud;

// Funciones globales de utilidad
window.actualizarSelectsGlobal = actualizarSelectsGlobal;

console.log('✅ Todas las funciones globales han sido registradas');