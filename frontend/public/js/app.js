// Estado global de la aplicación
let currentUser = null;
let currentRoute = 'pedidos';

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
});

// Verificar si el usuario está autenticado
async function checkAuth() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    redirectToLogin();
    return;
  }
  
  try {
    // Verificar que el token sea válido
    const response = await fetch('https://back-adm.fly.dev/api/pedidos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Token inválido');
    }
    
    currentUser = JSON.parse(userStr);
    showMainApp();
    loadRoute(currentRoute);
  } catch (error) {
    console.error('Error de autenticación:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    redirectToLogin();
  }
}

// Redirigir al login
function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// Mostrar la aplicación principal
function showMainApp() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
}

// Función de logout
function logout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

// Navegación
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-route]') || e.target.closest('[data-route]')) {
    const button = e.target.matches('[data-route]') ? e.target : e.target.closest('[data-route]');
    const route = button.getAttribute('data-route');
    navigateTo(route);
  }
});

function navigateTo(route) {
  currentRoute = route;
  
  // Actualizar botones activos
  document.querySelectorAll('.nav-button, .mobile-nav-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelectorAll(`[data-route="${route}"]`).forEach(btn => {
    btn.classList.add('active');
  });
  
  loadRoute(route);
}

// Cargar contenido de la ruta
async function loadRoute(route) {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
  
  try {
    switch (route) {
      case 'pedidos':
        await loadPedidos();
        break;
      case 'clientes':
        await loadClientes();
        break;
      case 'productos':
        await loadProductos();
        break;
      case 'pagos':
        await loadPagos();
        break;
      default:
        contentArea.innerHTML = '<div class="text-center py-8 text-gray-500">Página no encontrada</div>';
    }
  } catch (error) {
    console.error('Error cargando ruta:', error);
    contentArea.innerHTML = '<div class="text-center py-8 text-red-500">Error cargando contenido</div>';
  }
}

// Cargar pedidos
async function loadPedidos() {
  const token = localStorage.getItem('token');
  const response = await fetch('https://back-adm.fly.dev/api/pedidos', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error cargando pedidos');
  }
  
  const pedidos = await response.json();
  renderPedidos(pedidos);
}

function renderPedidos(pedidos) {
  const contentArea = document.getElementById('contentArea');
  
  const html = `
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Gestión de Pedidos
        </h3>
        
        <div class="mb-4">
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            + Nuevo Pedido
          </button>
        </div>
        
        <div class="grid gap-4">
          ${pedidos.map(pedido => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-semibold text-gray-900">#${pedido.id}</h4>
                  <p class="text-sm text-gray-600">${pedido.cliente_nombre}</p>
                  <p class="text-sm text-gray-500">${pedido.direccion}</p>
                  <p class="text-sm text-gray-500">${new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-green-600">$${pedido.total}</p>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pedido.estado)}">
                    ${pedido.estado}
                  </span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  contentArea.innerHTML = html;
}

function getStatusColor(estado) {
  switch (estado) {
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'En Preparación':
      return 'bg-blue-100 text-blue-800';
    case 'Entregado':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Cargar clientes
async function loadClientes() {
  const token = localStorage.getItem('token');
  const response = await fetch('https://back-adm.fly.dev/api/clientes', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error cargando clientes');
  }
  
  const clientes = await response.json();
  renderClientes(clientes);
}

function renderClientes(clientes) {
  const contentArea = document.getElementById('contentArea');
  
  const html = `
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Gestión de Clientes
        </h3>
        
        <div class="grid gap-4">
          ${clientes.map(cliente => `
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900">${cliente.nombre}</h4>
              <p class="text-sm text-gray-600">${cliente.telefono}</p>
              <p class="text-sm text-gray-500">${cliente.direccion}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  contentArea.innerHTML = html;
}

// Cargar productos
async function loadProductos() {
  const token = localStorage.getItem('token');
  const response = await fetch('https://back-adm.fly.dev/api/productos', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error cargando productos');
  }
  
  const productos = await response.json();
  renderProductos(productos);
}

function renderProductos(productos) {
  const contentArea = document.getElementById('contentArea');
  
  const html = `
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Gestión de Productos
        </h3>
        
        <div class="grid gap-4">
          ${productos.map(producto => `
            <div class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900">${producto.nombre}</h4>
              <p class="text-sm text-gray-600">$${producto.precio}</p>
              <p class="text-sm text-gray-500">${producto.descripcion || 'Sin descripción'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  contentArea.innerHTML = html;
}

// Cargar pagos
async function loadPagos() {
  const contentArea = document.getElementById('contentArea');
  
  const html = `
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Gestión de Pagos
        </h3>
        <p class="text-gray-600">Funcionalidad de pagos en desarrollo...</p>
      </div>
    </div>
  `;
  
  contentArea.innerHTML = html;
}
