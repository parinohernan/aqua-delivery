// Router simple y reactivo
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    register(path, component) {
        this.routes[path] = component;
    }

    async navigate(path, params = {}) {
        if (this.currentRoute === path) return;
        
        const component = this.routes[path];
        if (component) {
            this.currentRoute = path;
            this.updateNavigation(path);
            await this.render(component, params);
        }
    }

    updateNavigation(activePath) {
        // Actualizar navegación desktop
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Actualizar navegación móvil
        document.querySelectorAll('.bottom-nav-item').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activar botones correspondientes
        document.querySelectorAll(`[data-route="${activePath}"]`).forEach(btn => {
            btn.classList.add('active');
        });
    }

    async render(component, params) {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                Cargando contenido...
            </div>
        `;

        try {
            const html = await component.render(params);
            content.innerHTML = html;

            // Inicializar iconos Lucide después del render
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Ejecutar eventos después del render
            if (component.afterRender) {
                component.afterRender(params);
            }
        } catch (error) {
            console.error('Error renderizando componente:', error);
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i data-lucide="alert-circle"></i>
                    </div>
                    <h3>Error cargando contenido</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i data-lucide="refresh-cw"></i>
                        Recargar
                    </button>
                </div>
            `;

            // Inicializar iconos incluso en error
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    init() {
        // Manejar navegación con botones
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-route')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });
    }
}

// Instancia global del router
const router = new Router();

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando aplicación...');
    
    // Verificar si hay token
    const token = localStorage.getItem('token');
    if (!token) {
        showLogin();
        return;
    }
    
    // Registrar rutas
    router.register('pedidos', PedidosComponent);
    router.register('clientes', ClientesComponent);
    router.register('productos', ProductosComponent);
    router.register('pagos', PagosComponent);
    
    // Navegar a página inicial
    await router.navigate('pedidos');
});

// Mostrar formulario de login
function showLogin() {
    document.getElementById('main-content').innerHTML = `
        <div class="flex items-center justify-center" style="min-height: 80vh;">
            <div class="card" style="max-width: 400px; width: 100%;">
                <div class="card-body text-center">
                    <div class="mb-6">
                        <i data-lucide="droplets" style="font-size: 3rem; color: var(--primary-color);"></i>
                        <h2 class="text-2xl font-bold mt-4 mb-2">AquaDelivery</h2>
                        <p class="text-gray-600">Ingresa tus credenciales para continuar</p>
                    </div>

                    <form onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label">ID Telegram</label>
                            <input type="text" name="telegramId" class="form-input" required
                                   placeholder="Ej: freedom135">
                            <small class="text-gray-500 text-xs mt-1">Ejemplos: freedom135, mamaid, 00000</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Código Empresa</label>
                            <input type="text" name="codigoEmpresa" class="form-input" required
                                   placeholder="Ej: 1" value="1">
                            <small class="text-gray-500 text-xs mt-1">Para pruebas usa: 1</small>
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg">
                            <i data-lucide="log-in"></i>
                            Ingresar
                        </button>

                        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                            <strong>💡 Datos de prueba:</strong><br>
                            • ID Telegram: <code>freedom135</code> - Empresa: <code>1</code><br>
                            • ID Telegram: <code>mamaid</code> - Empresa: <code>1</code><br>
                            • ID Telegram: <code>00000</code> - Empresa: <code>1</code>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Inicializar iconos en el login
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Manejar login
async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const telegramId = formData.get('telegramId');
    const codigoEmpresa = formData.get('codigoEmpresa');

    // Mostrar loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px;"></div> Ingresando...';
    submitBtn.disabled = true;

    try {
        // Usar autenticación real
        const response = await api.login(telegramId, codigoEmpresa);

        // Mostrar toast de éxito con nombre del vendedor
        ui.showToast(`¡Bienvenido ${response.vendedor.nombre} ${response.vendedor.apellido}!`, 'success');

        // Registrar rutas y navegar
        router.register('pedidos', PedidosComponent);
        router.register('clientes', ClientesComponent);
        router.register('productos', ProductosComponent);
        router.register('pagos', PagosComponent);

        await router.navigate('pedidos');

    } catch (error) {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        ui.showToast('Error de login: ' + error.message, 'error');
    }
}

// Función de logout
function logout() {
    ui.showConfirm(
        'Cerrar Sesión',
        '¿Está seguro que desea cerrar sesión?',
        'confirmLogout'
    );
}

function confirmLogout() {
    // Limpiar datos de autenticación
    storage.logout();
    api.setToken(null);

    // Mostrar mensaje
    ui.showToast('Sesión cerrada correctamente', 'info');

    // Redirigir al login
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay una sesión activa
    if (storage.isAuthenticated()) {
        const token = storage.getToken();
        const vendedor = storage.getVendedor();

        if (token && vendedor) {
            // Configurar API con token existente
            api.setToken(token);

            // Registrar rutas
            router.register('pedidos', PedidosComponent);
            router.register('clientes', ClientesComponent);
            router.register('productos', ProductosComponent);
            router.register('pagos', PagosComponent);

            // Navegar a pedidos
            router.navigate('pedidos');

            // Mostrar mensaje de bienvenida
            ui.showToast(`Bienvenido de nuevo, ${vendedor.nombre}!`, 'success');
        } else {
            // Limpiar datos inconsistentes
            storage.logout();
            showLogin();
        }
    } else {
        showLogin();
    }
});

// Service Worker (sin iconos por ahora)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('SW registrado'))
        .catch(err => console.log('Error SW:', err));
}
