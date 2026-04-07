// ==================== ADMIN: USUARIOS ====================
function renderUsuariosAdmin() {
    const tbody = document.getElementById('tablaUsuarios');
    if (!tbody) return;
    tbody.innerHTML = window.usuarios.filter(u => u.rol === 'empleado').map(user => {
        const puesto = window.puestos.find(p => p.id === user.puestoId);
        const añoIngreso = user.fechaIngreso ? new Date(user.fechaIngreso).getFullYear() : '-';
        return `<tr>
            <td>${user.nombre}</td>
            <td>${user.email || '-'}</td>
            <td>${puesto?.nombre || '-'}</td>
            <td>${puesto?.area || '-'}</td>
            <td>${puesto ? formatoUY.format(puesto.sueldoMensual) : '-'}</td>
            <td>${añoIngreso} ✏️</button></td>
            <td><button class="btn-delete" onclick="eliminarUsuario('${user.id}')">🗑️</button></td>
        </tr>`;
    }).join('');
}

function crearUsuario() {
    const nombre = document.getElementById('nuevoUserNombre').value.trim();
    const email = document.getElementById('nuevoUserEmail').value.trim();
    const password = document.getElementById('nuevoUserPass').value;
    const puestoId = document.getElementById('nuevoUserPuesto').value;
    const fechaIngreso = document.getElementById('nuevoUserFechaIngreso').value;

    if (!nombre || !password || password.length < 3 || !puestoId || !fechaIngreso) {
        mostrarNotificacion('Complete todos los campos obligatorios', 'error');
        return;
    }

    if (window.usuarios.find(u => u.nombre === nombre)) {
        mostrarNotificacion('Ya existe un usuario con ese nombre', 'error');
        return;
    }

    window.usuarios.push({
        id: Date.now().toString(),
        nombre, email: email || null,
        password: hashPassword(password),
        rol: 'empleado', puestoId, fechaIngreso, activo: true
    });
    guardarTodo();
    renderUsuariosAdmin();
    actualizarSelectsGlobal();
    
    document.getElementById('nuevoUserNombre').value = '';
    document.getElementById('nuevoUserEmail').value = '';
    document.getElementById('nuevoUserPass').value = '';
    document.getElementById('nuevoUserPuesto').value = '';
    document.getElementById('nuevoUserFechaIngreso').value = '';
    mostrarNotificacion(`Usuario ${nombre} creado`, 'success');
}

function eliminarUsuario(id) {
    const user = window.usuarios.find(u => u.id === id);
    mostrarConfirmacion(`¿Eliminar usuario "${user?.nombre}"?`, () => {
        window.usuarios = window.usuarios.filter(u => u.id !== id);
        window.registros = window.registros.filter(r => r.usuarioId !== id);
        window.ausencias = window.ausencias.filter(a => a.usuarioId !== id);
        window.licencias = window.licencias.filter(l => l.usuarioId !== id);
        window.recibos = window.recibos.filter(r => r.empleadoId !== id);
        guardarTodo();
        renderUsuariosAdmin();
        actualizarSelectsGlobal();
        mostrarNotificacion('Usuario eliminado', 'success');
    });
}