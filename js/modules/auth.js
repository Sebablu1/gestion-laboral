// ==================== AUTH ====================
function mostrarLogin() {
    document.getElementById('loginPanel')?.classList.remove('hidden');
    document.getElementById('mainContent')?.classList.add('hidden');
    window.usuarioActual = null;
    if (window.temporizadorJornada) clearInterval(window.temporizadorJornada);
}

function doLogin(event) {
    event.preventDefault();
    const identificador = document.getElementById('loginUsuario').value.trim();
    const password = document.getElementById('loginPassword').value;

    const user = window.usuarios.find(u => 
        (u.email && u.email === identificador) || u.nombre === identificador
    );

    if (!user) {
        mostrarNotificacion('Usuario no encontrado', 'error');
        return;
    }

    if (!verificarPassword(password, user.password)) {
        mostrarNotificacion('Contraseña incorrecta', 'error');
        return;
    }

    window.usuarioActual = user;
    registrarAuditoria('login', `Inicio de sesión: ${user.nombre}`);
    
    // Llamar a mostrarMain que está en app.js
    if (typeof mostrarMain === 'function') {
        mostrarMain();
    }
}

function cerrarSesion() {
    if (window.temporizadorJornada) clearInterval(window.temporizadorJornada);
    window.usuarioActual = null;
    mostrarLogin();
}