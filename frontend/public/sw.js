const CACHE_NAME = 'aqua-delivery-v6';
const urlsToCache = [
    '/',
    '/styles.css',
    '/js/ui.js',
    '/js/app.js',
    '/js/services/storage.js',
    '/js/models/Cliente.js',
    '/js/models/Producto.js',
    '/js/models/Pedido.js',
    '/js/components/pedidos.js',
    '/js/components/clientes.js',
    '/js/components/productos.js',
    '/js/components/pagos.js',
    '/js/ClientModal.js',
    '/js/ClientPaymentModal.js',
    '/leaflet.css',
    '/leaflet.js',
    '/map-pwa.js'
];

// Lista de archivos que pueden fallar sin problemas
const optionalFiles = [
    '/favicon.ico',
    '/icon-192.png',
    '/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Cachear archivos esenciales
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Intentar cachear archivos opcionales sin fallar
                return caches.open(CACHE_NAME).then(cache => {
                    return Promise.allSettled(
                        optionalFiles.map(url =>
                            fetch(url).then(response => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                            }).catch(() => {
                                // Ignorar errores de archivos opcionales
                                console.log(`Archivo opcional no encontrado: ${url}`);
                            })
                        )
                    );
                });
            })
    );
});

// Limpiar caches antiguos cuando se activa el nuevo Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Manejar mensajes del cliente (especialmente para Android)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('🗑️ Limpiando caché por solicitud del cliente...');
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('🗑️ Eliminando cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                // Notificar al cliente que el caché se limpió
                event.ports[0]?.postMessage({ type: 'CACHE_CLEARED' });
            })
        );
    }
});

self.addEventListener('fetch', event => {
    // Ignorar requests de extensiones del navegador
    if (event.request.url.startsWith('chrome-extension://') ||
        event.request.url.startsWith('moz-extension://')) {
        return;
    }

    // Permitir que TODAS las peticiones externas pasen directamente sin interceptar
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Solo interceptar peticiones del mismo origen
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request).catch(error => {
                    // Si es un archivo opcional que falla, devolver una respuesta vacía
                    if (optionalFiles.some(file => event.request.url.endsWith(file))) {
                        return new Response('', { status: 404 });
                    }

                    // Para otros archivos, re-lanzar el error
                    throw error;
                });
            })
    );
});

// ===== NOTIFICACIONES PUSH =====

// Escuchar notificaciones push
self.addEventListener('push', event => {
    console.log('🔔 Notificación push recibida:', event);
    
    let notificationData = {
        title: 'AquaDelivery',
        body: 'Tienes una nueva notificación',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'aqua-notification',
        requireInteraction: false,
        data: {}
    };

    // Si hay datos en el evento push, usarlos
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data,
                data: data.data || {}
            };
        } catch (e) {
            // Si no es JSON, usar como texto
            notificationData.body = event.data.text() || notificationData.body;
        }
    }

    // Mostrar la notificación
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: notificationData.data,
            vibrate: [200, 100, 200],
            actions: notificationData.actions || []
        })
    );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
    console.log('🔔 Notificación clickeada:', event);
    
    event.notification.close();

    // Si hay una URL en los datos, abrirla
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    } else {
        // Si no hay URL, enfocar/abrir la aplicación
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(clientList => {
                    // Si hay una ventana abierta, enfocarla
                    for (let client of clientList) {
                        if (client.url === '/' && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Si no hay ventana abierta, abrir una nueva
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

// Manejar acciones de notificaciones
self.addEventListener('notificationclose', event => {
    console.log('🔔 Notificación cerrada:', event);
});