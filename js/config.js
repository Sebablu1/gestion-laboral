// ==================== CONFIGURACIÓN GLOBAL ====================
const CONFIG = {
    APP_NAME: "Sistema Laboral Uruguay",
    VERSION: "1.0.0",
    DEFAULT_ADMIN: {
        nombre: "Administrador",
        email: "admin",
        password: "admin"
    },
    DEFAULT_PUESTOS: [
        { id: 'p1', nombre: 'Vendedor', area: 'Ventas', sueldoMensual: 35000, horasMensuales: 44 },
        { id: 'p2', nombre: 'Desarrollador', area: 'TI', sueldoMensual: 55000, horasMensuales: 44 },
        { id: 'p3', nombre: 'Gerente', area: 'Gerencia', sueldoMensual: 80000, horasMensuales: 44 },
        { id: 'p4', nombre: 'Administrativo', area: 'Administración', sueldoMensual: 40000, horasMensuales: 44 }
    ],
    DEFAULT_AREAS: ['Gerencia', 'Ventas', 'TI', 'Administración']
};

const STORAGE_KEYS = {
    USUARIOS: 'lab_usuarios',
    REGISTROS: 'lab_registros',
    RECIBOS: 'lab_recibos',
    DEDUCCIONES: 'lab_deducciones',
    ADICIONALES: 'lab_adicionales',
    AUSENCIAS: 'lab_ausencias',
    LICENCIAS: 'lab_licencias',
    AUDITORIA: 'lab_auditoria',
    MESES_CERRADOS: 'lab_meses_cerrados',
    EDICIONES_PENDIENTES: 'lab_ediciones_pendientes',
    NOTIFICACIONES: 'lab_notificaciones',
    AREAS: 'lab_areas',
    PUESTOS: 'lab_puestos',
    CONFIG: 'lab_config',
    EMPRESA: 'lab_empresa'
};

// ==================== FORMATOS GLOBALES ====================
window.formatoUY = new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// ==================== INICIALIZAR DATOS POR DEFECTO ====================
function inicializarDatosPorDefecto() {
    // Convertir áreas de string a objeto si es necesario
    if (window.areas.length === 0) {
        window.areas = [
            { id: 'area1', nombre: 'Gerencia' },
            { id: 'area2', nombre: 'Ventas' },
            { id: 'area3', nombre: 'TI' },
            { id: 'area4', nombre: 'Administración' }
        ];
    } else if (window.areas.length > 0 && typeof window.areas[0] === 'string') {
        window.areas = window.areas.map((nombre, index) => ({
            id: `area_${index}`,
            nombre: nombre
        }));
    }
    
    if (window.puestos.length === 0) {
        window.puestos = [
            { id: 'p1', nombre: 'Vendedor', area: 'Ventas', sueldoMensual: 35000, horasMensuales: 44 },
            { id: 'p2', nombre: 'Desarrollador', area: 'TI', sueldoMensual: 55000, horasMensuales: 44 },
            { id: 'p3', nombre: 'Gerente', area: 'Gerencia', sueldoMensual: 80000, horasMensuales: 44 },
            { id: 'p4', nombre: 'Administrativo', area: 'Administración', sueldoMensual: 40000, horasMensuales: 44 }
        ];
    }
    
    // Crear usuario admin si no existe
    const adminExiste = window.usuarios.some(u => u.rol === 'admin');
    if (!adminExiste) {
        window.usuarios.push({
            id: 'admin1',
            nombre: 'Administrador',
            email: 'admin',
            password: hashPassword('admin'),
            rol: 'admin',
            activo: true
        });
    }
    
    if (Object.keys(window.config).length === 0) {
        window.config = {
            extraPorcentaje: 50,
            bpsPorcentaje: 15,
            fonasaPorcentaje: 4.5,
            irpfPorcentaje: 0,
            jornadaDiaria: 8
        };
    }
    
    if (Object.keys(window.empresa).length === 0) {
        window.empresa = {
            nombre: 'Mi Empresa S.A.',
            rut: '99.999.999-9',
            direccion: 'Av. Uruguay 123',
            logo: '🏢'
        };
    }
    
    guardarTodo();
}

// Exportar
window.CONFIG = CONFIG;
window.STORAGE_KEYS = STORAGE_KEYS;
window.inicializarDatosPorDefecto = inicializarDatosPorDefecto;