// Configuración PWA para AquaDelivery
const PWA_CONFIG = {
  // Nombre de la aplicación
  appName: 'AquaDelivery',
  
  // Configuración del Service Worker
  swConfig: {
    cacheName: 'aqua-delivery-v3',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
  
  // Configuración de instalación
  installConfig: {
    prompt: true,
    beforeInstallPrompt: null,
  },
  
  // Configuración de actualización
  updateConfig: {
    checkInterval: 24 * 60 * 60 * 1000, // 24 horas
    showUpdatePrompt: true,
  }
};

// Función para manejar la instalación de la PWA
function handlePWAInstall() {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que Chrome muestre automáticamente el prompt
    e.preventDefault();
    // Guardar el evento para usarlo después
    deferredPrompt = e;
    PWA_CONFIG.installConfig.beforeInstallPrompt = e;
    
    console.log('📱 PWA instalable detectada');
    
    // Opcional: Mostrar un botón de instalación personalizado
    showInstallButton();
  });
  
  window.addEventListener('appinstalled', (evt) => {
    console.log('✅ PWA instalada exitosamente');
    // Limpiar el prompt guardado
    deferredPrompt = null;
    PWA_CONFIG.installConfig.beforeInstallPrompt = null;
    
    // Ocultar el botón de instalación si existe
    hideInstallButton();
  });
}

// Función para mostrar botón de instalación
function showInstallButton() {
  // Crear botón de instalación si no existe
  if (!document.getElementById('pwa-install-btn')) {
    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.innerHTML = '📱 Instalar App';
    installBtn.className = 'pwa-install-btn';
    installBtn.onclick = installPWA;
    
    // Agregar estilos
    installBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #4ade80, #22c55e);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(installBtn);
  }
}

// Función para ocultar botón de instalación
function hideInstallButton() {
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.remove();
  }
}

// Función para instalar la PWA
async function installPWA() {
  if (PWA_CONFIG.installConfig.beforeInstallPrompt) {
    // Mostrar el prompt de instalación
    PWA_CONFIG.installConfig.beforeInstallPrompt.prompt();
    
    // Esperar la respuesta del usuario
    const { outcome } = await PWA_CONFIG.installConfig.beforeInstallPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó instalar la PWA');
    } else {
      console.log('❌ Usuario rechazó instalar la PWA');
    }
    
    // Limpiar el prompt
    PWA_CONFIG.installConfig.beforeInstallPrompt = null;
    hideInstallButton();
  }
}

// Función para verificar si la PWA está instalada
function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

// Función para manejar actualizaciones del Service Worker
function handleSWUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker actualizado');
      
      if (PWA_CONFIG.updateConfig.showUpdatePrompt) {
        // Mostrar notificación de actualización
        showUpdateNotification();
      }
    });
  }
}

// Función para mostrar notificación de actualización
function showUpdateNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('AquaDelivery Actualizada', {
      body: 'La aplicación se ha actualizado. Recarga para ver los cambios.',
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    });
  }
}

// Función para solicitar permisos de notificación
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('🔔 Permiso de notificación:', permission);
    return permission;
  }
  return 'denied';
}

// Inicializar configuración PWA
function initPWA() {
  console.log('🚀 Inicializando PWA...');
  
  // Manejar instalación
  handlePWAInstall();
  
  // Manejar actualizaciones
  handleSWUpdate();
  
  // Verificar si ya está instalada
  if (isPWAInstalled()) {
    console.log('📱 PWA ya está instalada');
  }
  
  // Solicitar permisos de notificación
  requestNotificationPermission();
}

// Exportar funciones para uso global
window.PWA_CONFIG = PWA_CONFIG;
window.installPWA = installPWA;
window.isPWAInstalled = isPWAInstalled;
window.initPWA = initPWA;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}
