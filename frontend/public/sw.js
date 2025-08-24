const CACHE_NAME = 'aqua-delivery-v3';
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
    '/js/components/pagos.js'
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

self.addEventListener('fetch', event => {
    // Ignorar requests de extensiones del navegador
    if (event.request.url.startsWith('chrome-extension://') ||
        event.request.url.startsWith('moz-extension://')) {
        return;
    }

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