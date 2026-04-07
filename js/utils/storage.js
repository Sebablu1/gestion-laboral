// ==================== STORAGE ====================

function guardarEnStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (e) {
        console.warn(`Error guardando ${clave}:`, e);
        return false;
    }
}

function obtenerDeStorage(clave, defaultValue) {
    try {
        const item = localStorage.getItem(clave);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn(`Error leyendo ${clave}:`, e);
        return defaultValue;
    }
}

function guardarTodo() {
    guardarEnStorage(STORAGE_KEYS.USUARIOS, window.usuarios);
    guardarEnStorage(STORAGE_KEYS.REGISTROS, window.registros);
    guardarEnStorage(STORAGE_KEYS.RECIBOS, window.recibos);
    guardarEnStorage(STORAGE_KEYS.DEDUCCIONES, window.deducciones);
    guardarEnStorage(STORAGE_KEYS.ADICIONALES, window.adicionales);
    guardarEnStorage(STORAGE_KEYS.AUSENCIAS, window.ausencias);
    guardarEnStorage(STORAGE_KEYS.LICENCIAS, window.licencias);
    guardarEnStorage(STORAGE_KEYS.AUDITORIA, window.auditoria);
    guardarEnStorage(STORAGE_KEYS.MESES_CERRADOS, window.mesesCerrados);
    guardarEnStorage(STORAGE_KEYS.EDICIONES_PENDIENTES, window.edicionesPendientes);
    guardarEnStorage(STORAGE_KEYS.NOTIFICACIONES, window.notificaciones);
    guardarEnStorage(STORAGE_KEYS.AREAS, window.areas);
    guardarEnStorage(STORAGE_KEYS.PUESTOS, window.puestos);
    guardarEnStorage(STORAGE_KEYS.CONFIG, window.config);
    guardarEnStorage(STORAGE_KEYS.EMPRESA, window.empresa);
}

function cargarDatos() {
    window.usuarios = obtenerDeStorage(STORAGE_KEYS.USUARIOS, []);
    window.registros = obtenerDeStorage(STORAGE_KEYS.REGISTROS, []);
    window.recibos = obtenerDeStorage(STORAGE_KEYS.RECIBOS, []);
    window.deducciones = obtenerDeStorage(STORAGE_KEYS.DEDUCCIONES, []);
    window.adicionales = obtenerDeStorage(STORAGE_KEYS.ADICIONALES, []);
    window.ausencias = obtenerDeStorage(STORAGE_KEYS.AUSENCIAS, []);
    window.licencias = obtenerDeStorage(STORAGE_KEYS.LICENCIAS, []);
    window.auditoria = obtenerDeStorage(STORAGE_KEYS.AUDITORIA, []);
    window.mesesCerrados = obtenerDeStorage(STORAGE_KEYS.MESES_CERRADOS, []);
    window.edicionesPendientes = obtenerDeStorage(STORAGE_KEYS.EDICIONES_PENDIENTES, []);
    window.notificaciones = obtenerDeStorage(STORAGE_KEYS.NOTIFICACIONES, []);
    
    // Convertir áreas: si son strings, convertirlas a objetos con id y nombre
    const areasRaw = obtenerDeStorage(STORAGE_KEYS.AREAS, CONFIG.DEFAULT_AREAS);
    if (areasRaw.length > 0 && typeof areasRaw[0] === 'string') {
        window.areas = areasRaw.map((nombre, index) => ({
            id: `area_${Date.now()}_${index}`,
            nombre: nombre
        }));
    } else {
        window.areas = areasRaw;
    }
    
    window.puestos = obtenerDeStorage(STORAGE_KEYS.PUESTOS, []);
    window.config = obtenerDeStorage(STORAGE_KEYS.CONFIG, { 
        extraPorcentaje: 50, 
        bpsPorcentaje: 15, 
        fonasaPorcentaje: 4.5, 
        irpfPorcentaje: 0, 
        jornadaDiaria: 8 
    });
    window.empresa = obtenerDeStorage(STORAGE_KEYS.EMPRESA, { 
        nombre: "Mi Empresa S.A.", 
        rut: "99.999.999-9", 
        direccion: "Av. Principal 123", 
        logo: "🏢" 
    });
}

function inicializarDatosPorDefecto() {
    // ==============================================
    // SOLO CREAR ADMIN POR DEFECTO (admin / admin)
    // Los empleados los crea el admin manualmente
    // ==============================================
    
    const adminExiste = window.usuarios.some(u => u.rol === 'admin');
    
    if (!adminExiste) {
        window.usuarios.push({ 
            id: 'admin_1', 
            nombre: 'Administrador', 
            email: 'admin', 
            password: hashPassword('admin'), 
            rol: 'admin', 
            puestoId: null, 
            activo: true 
        });
        console.log('✅ Usuario admin creado (admin / admin)');
    }
    
    // Crear áreas por defecto SOLO si no hay áreas
    if (window.areas.length === 0 && CONFIG.DEFAULT_AREAS) {
        window.areas = CONFIG.DEFAULT_AREAS.map((nombre, index) => ({
            id: `area_def_${index}`,
            nombre: nombre
        }));
        console.log('✅ Áreas por defecto creadas');
    }
    
    // Crear puestos por defecto SOLO si no hay puestos
    if (window.puestos.length === 0 && CONFIG.DEFAULT_PUESTOS) {
        window.puestos = CONFIG.DEFAULT_PUESTOS.map((p, index) => ({
            id: p.id || `puesto_${Date.now()}_${index}`,
            nombre: p.nombre,
            area: p.area,
            sueldoMensual: p.sueldoMensual,
            horasMensuales: p.horasMensuales,
            valorHora: p.sueldoMensual / p.horasMensuales
        }));
        console.log('✅ Puestos por defecto creados');
    }
    
    // NO se crean empleados de ejemplo automáticamente
    // El admin los creará desde el Panel Admin > Usuarios
    
    guardarTodo();
}