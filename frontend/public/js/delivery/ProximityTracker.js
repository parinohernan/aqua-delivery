/**
 * ProximityTracker - Sistema de tracking GPS continuo con notificaciones de proximidad
 * Responsabilidad: Tracking automático y notificaciones cuando se acerca a destinos
 */
class ProximityTracker {
    constructor() {
        this.isTracking = false;
        this.watchId = null;
        this.currentPosition = null;
        this.pendingDeliveries = [];
        this.notifiedDeliveries = new Set();
        this.trackingInterval = 30000; // 30 segundos
        this.proximityThreshold = 500; // 500 metros por defecto
        this.intervalId = null;
        this.lastNotificationTime = {};
    }

    /**
     * Inicia el tracking GPS
     * @returns {Promise<boolean>} True si se inició correctamente
     */
    async startTracking() {
        console.log('🚀 Iniciando tracking GPS...');

        if (this.isTracking) {
            console.warn('⚠️ El tracking ya está activo');
            return true;
        }

        try {
            // Verificar permisos
            const hasPermissions = await window.geolocationPermissions.hasAllPermissions();

            if (!hasPermissions) {
                // Mostrar explicación y solicitar permisos
                const userAccepted = await window.geolocationPermissions.showPermissionExplanation();

                if (!userAccepted) {
                    console.log('❌ Usuario canceló solicitud de permisos');
                    return false;
                }

                const permissionsResult = await window.geolocationPermissions.requestAllPermissions();

                if (!permissionsResult.success) {
                    throw new Error('No se pudieron obtener todos los permisos necesarios');
                }
            }

            // Obtener pedidos pendientes
            this.updatePendingDeliveries();

            if (this.pendingDeliveries.length === 0) {
                if (window.showNotification) {
                    window.showNotification('No hay pedidos pendientes para trackear', 'info');
                }
                return false;
            }

            // Iniciar watchPosition
            this.startWatchPosition();

            // Iniciar intervalo de verificación
            this.startProximityCheck();

            this.isTracking = true;
            this.saveTrackingState();
            this.updateUI();

            console.log('✅ Tracking iniciado correctamente');

            if (window.showNotification) {
                window.showNotification(
                    `Tracking GPS activado - ${this.pendingDeliveries.length} entregas pendientes`,
                    'success'
                );
            }

            return true;

        } catch (error) {
            console.error('❌ Error iniciando tracking:', error);

            if (window.showNotification) {
                window.showNotification(`Error: ${error.message}`, 'error');
            }

            return false;
        }
    }

    /**
     * Detiene el tracking GPS
     */
    stopTracking() {
        console.log('⏹️ Deteniendo tracking GPS...');

        if (!this.isTracking) {
            console.warn('⚠️ El tracking no está activo');
            return;
        }

        // Detener watchPosition
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        // Detener intervalo
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isTracking = false;
        this.currentPosition = null;
        this.saveTrackingState();
        this.updateUI();

        console.log('✅ Tracking detenido');

        if (window.showNotification) {
            window.showNotification('Tracking GPS desactivado', 'info');
        }
    }

    /**
     * Inicia el watchPosition para tracking continuo
     */
    startWatchPosition() {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.updatePosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                console.error('❌ Error en watchPosition:', error);
                this.handlePositionError(error);
            },
            options
        );

        console.log('📍 watchPosition iniciado con ID:', this.watchId);
    }

    /**
     * Inicia el intervalo de verificación de proximidad
     */
    startProximityCheck() {
        // Verificar inmediatamente
        this.checkProximity();

        // Luego verificar cada intervalo
        this.intervalId = setInterval(() => {
            this.checkProximity();
        }, this.trackingInterval);

        console.log(`⏱️ Intervalo de verificación iniciado (cada ${this.trackingInterval / 1000}s)`);
    }

    /**
     * Actualiza la posición actual
     * @param {Object} position - Nueva posición {lat, lng, accuracy, timestamp}
     */
    updatePosition(position) {
        this.currentPosition = position;
        console.log('📍 Posición actualizada:', position);

        // Actualizar UI si existe
        this.updateUI();
    }

    /**
     * Verifica proximidad a destinos
     */
    checkProximity() {
        if (!this.currentPosition || !this.isTracking) {
            return;
        }

        console.log('🔍 Verificando proximidad a destinos...');

        this.updatePendingDeliveries();

        const nearbyDeliveries = [];

        this.pendingDeliveries.forEach(delivery => {
            if (!delivery.latitud || !delivery.longitud) return;

            const distance = window.GeoUtils.calculateDistance(
                this.currentPosition.lat,
                this.currentPosition.lng,
                parseFloat(delivery.latitud),
                parseFloat(delivery.longitud)
            );

            const deliveryId = delivery.codigo || delivery.id;

            // Verificar si está dentro del umbral
            if (distance <= this.proximityThreshold) {
                // Verificar si ya fue notificado
                if (!this.notifiedDeliveries.has(deliveryId)) {
                    nearbyDeliveries.push({ ...delivery, distance });
                }
            } else {
                // Si se alejó, remover de notificados
                this.notifiedDeliveries.delete(deliveryId);
            }
        });

        // Enviar notificaciones para entregas cercanas
        nearbyDeliveries.forEach(delivery => {
            this.sendProximityNotification(delivery);
        });

        if (nearbyDeliveries.length > 0) {
            console.log(`🔔 ${nearbyDeliveries.length} entregas cercanas detectadas`);
        }
    }

    /**
     * Envía notificación de proximidad
     * @param {Object} delivery - Pedido con distancia
     */
    async sendProximityNotification(delivery) {
        const deliveryId = delivery.codigo || delivery.id;

        // Evitar notificaciones duplicadas en corto tiempo
        const now = Date.now();
        const lastNotif = this.lastNotificationTime[deliveryId] || 0;

        if (now - lastNotif < 60000) { // 1 minuto mínimo entre notificaciones
            return;
        }

        this.lastNotificationTime[deliveryId] = now;
        this.notifiedDeliveries.add(deliveryId);

        const nombreCliente = delivery.cliente_nombre || `${delivery.nombre || ''} ${delivery.apellido || ''}`.trim();
        const distanceText = window.GeoUtils.formatDistance(delivery.distance);

        console.log(`🔔 Enviando notificación para pedido #${deliveryId}`);

        // Notificación del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('📍 Llegando a destino', {
                body: `Estás a ${distanceText} de la entrega #${deliveryId} - ${nombreCliente}`,
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                tag: `proximity-${deliveryId}`,
                requireInteraction: true,
                data: {
                    deliveryId: deliveryId,
                    clientName: nombreCliente,
                    distance: delivery.distance
                }
            });

            notification.onclick = () => {
                window.focus();
                notification.close();

                // Abrir modal de entrega si existe
                if (window.startDelivery) {
                    window.startDelivery(deliveryId);
                }
            };
        }

        // Notificación visual en la app
        if (window.showNotification) {
            window.showNotification(
                `📍 Estás a ${distanceText} del pedido #${deliveryId} - ${nombreCliente}`,
                'info'
            );
        }

        // Vibración si está disponible
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Sonido (opcional)
        this.playNotificationSound();
    }

    /**
     * Reproduce sonido de notificación
     */
    playNotificationSound() {
        try {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('No se pudo reproducir sonido:', e));
        } catch (e) {
            // Ignorar si no hay sonido
        }
    }

    /**
     * Actualiza la lista de pedidos pendientes
     */
    updatePendingDeliveries() {
        const allPedidos = window.allPedidos || window.currentPedidos || [];
        this.pendingDeliveries = allPedidos.filter(p =>
            p.estado === 'pendient' && p.latitud && p.longitud
        );

        console.log(`📦 Pedidos pendientes actualizados: ${this.pendingDeliveries.length}`);

        // Auto-pausar si no hay pedidos
        if (this.pendingDeliveries.length === 0 && this.isTracking) {
            console.log('⏸️ Auto-pausando: no hay pedidos pendientes');
            this.stopTracking();
        }
    }

    /**
     * Maneja errores de posición
     * @param {Object} error - Error de geolocalización
     */
    handlePositionError(error) {
        let errorMessage = 'Error obteniendo ubicación';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Permiso de ubicación denegado';
                this.stopTracking();
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Ubicación no disponible';
                break;
            case error.TIMEOUT:
                errorMessage = 'Tiempo de espera agotado';
                break;
        }

        console.error('❌ Error de posición:', errorMessage);

        if (window.showNotification) {
            window.showNotification(errorMessage, 'error');
        }
    }

    /**
     * Cambia el umbral de proximidad
     * @param {number} meters - Nueva distancia en metros
     */
    setProximityThreshold(meters) {
        this.proximityThreshold = meters;
        console.log(`📏 Umbral de proximidad actualizado: ${meters}m`);

        // Limpiar notificaciones anteriores para re-evaluar con nuevo umbral
        this.notifiedDeliveries.clear();

        this.saveTrackingState();
        this.updateUI();
    }

    /**
     * Guarda el estado del tracking en localStorage
     */
    saveTrackingState() {
        const state = {
            trackingEnabled: this.isTracking,
            proximityDistance: this.proximityThreshold,
            lastPosition: this.currentPosition,
            notifiedDeliveries: Array.from(this.notifiedDeliveries),
            timestamp: Date.now()
        };

        localStorage.setItem('proximityTrackerState', JSON.stringify(state));
    }

    /**
     * Restaura el estado del tracking desde localStorage
     */
    restoreTrackingState() {
        try {
            const stateStr = localStorage.getItem('proximityTrackerState');
            if (!stateStr) return;

            const state = JSON.parse(stateStr);

            this.proximityThreshold = state.proximityDistance || 500;
            this.notifiedDeliveries = new Set(state.notifiedDeliveries || []);

            console.log('✅ Estado del tracking restaurado');
        } catch (error) {
            console.error('❌ Error restaurando estado:', error);
        }
    }

    /**
     * Actualiza la UI del tracking
     */
    updateUI() {
        const statusEl = document.getElementById('trackingStatus');
        const toggleBtn = document.getElementById('toggleTrackingBtn');
        const distanceSelect = document.getElementById('proximityDistance');

        if (statusEl) {
            if (this.isTracking) {
                statusEl.classList.remove('hidden');
                const nearbyCount = this.pendingDeliveries.filter(d => {
                    if (!d.latitud || !d.longitud || !this.currentPosition) return false;
                    const distance = window.GeoUtils.calculateDistance(
                        this.currentPosition.lat,
                        this.currentPosition.lng,
                        parseFloat(d.latitud),
                        parseFloat(d.longitud)
                    );
                    return distance <= this.proximityThreshold;
                }).length;

                statusEl.querySelector('span').textContent =
                    `Tracking activo - ${nearbyCount} entregas a ${this.proximityThreshold}m`;
            } else {
                statusEl.classList.add('hidden');
            }
        }

        if (toggleBtn) {
            if (this.isTracking) {
                toggleBtn.innerHTML = `
          <span class="tracking-icon">⏹️</span>
          <span class="tracking-text">Detener Tracking</span>
        `;
                toggleBtn.classList.add('active');
            } else {
                toggleBtn.innerHTML = `
          <span class="tracking-icon">📍</span>
          <span class="tracking-text">Iniciar Tracking GPS</span>
        `;
                toggleBtn.classList.remove('active');
            }
        }

        if (distanceSelect) {
            distanceSelect.value = this.proximityThreshold;
            distanceSelect.disabled = this.isTracking;
        }
    }
}

// Crear instancia global
window.proximityTracker = new ProximityTracker();
window.ProximityTracker = ProximityTracker;

// Restaurar estado al cargar
window.proximityTracker.restoreTrackingState();

console.log('✅ ProximityTracker module loaded');
