/**
 * Manejo de notificaciones push para AquaDelivery
 */

class PushNotifications {
    constructor() {
        this.vapidPublicKey = null;
        this.subscription = null;
        this.apiUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
    }

    /**
     * Inicializar notificaciones push
     */
    async init() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('⚠️ Este navegador no soporta notificaciones push');
            return false;
        }

        try {
            // Obtener clave pública VAPID
            await this.getVapidPublicKey();

            // Solicitar permiso de notificaciones
            const permission = await this.requestPermission();
            if (permission !== 'granted') {
                console.log('⚠️ Permiso de notificaciones denegado');
                return false;
            }

            // Registrar service worker si no está registrado
            await this.registerServiceWorker();

            // Suscribirse a notificaciones push
            await this.subscribe();

            console.log('✅ Notificaciones push inicializadas');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando notificaciones push:', error);
            return false;
        }
    }

    /**
     * Obtener clave pública VAPID del servidor
     */
    async getVapidPublicKey() {
        try {
            const response = await fetch(`${this.apiUrl}/api/push/vapid-public-key`);
            if (!response.ok) {
                throw new Error('Error obteniendo VAPID key');
            }
            const data = await response.json();
            this.vapidPublicKey = data.publicKey;
            console.log('✅ VAPID public key obtenida');
        } catch (error) {
            console.error('❌ Error obteniendo VAPID key:', error);
            throw error;
        }
    }

    /**
     * Solicitar permiso de notificaciones
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            return 'denied';
        }

        let permission = Notification.permission;

        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        return permission;
    }

    /**
     * Registrar service worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.ready;
            console.log('✅ Service Worker ya está registrado');
            return registration;
        } catch (error) {
            // Si no está registrado, registrarlo
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registrado');
                return registration;
            } catch (err) {
                console.error('❌ Error registrando Service Worker:', err);
                throw err;
            }
        }
    }

    /**
     * Suscribirse a notificaciones push
     */
    async subscribe(grupo = 'all') {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Verificar si ya existe una suscripción
            let subscription = await registration.pushManager.getSubscription();
            
            if (!subscription) {
                // Crear nueva suscripción
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
                });
            }

            this.subscription = subscription;

            // Enviar suscripción al servidor
            await this.sendSubscriptionToServer(subscription, grupo);

            console.log('✅ Suscripción push registrada');
            return subscription;
        } catch (error) {
            console.error('❌ Error suscribiéndose a notificaciones:', error);
            throw error;
        }
    }

    /**
     * Enviar suscripción al servidor
     */
    async sendSubscriptionToServer(subscription, grupo = 'all') {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('⚠️ No hay token de autenticación, no se puede registrar suscripción');
                return;
            }

            const response = await fetch(`${this.apiUrl}/api/push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subscription: {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
                            auth: this.arrayBufferToBase64(subscription.getKey('auth'))
                        }
                    },
                    grupo: grupo
                })
            });

            if (!response.ok) {
                throw new Error('Error registrando suscripción en el servidor');
            }

            console.log('✅ Suscripción enviada al servidor');
        } catch (error) {
            console.error('❌ Error enviando suscripción al servidor:', error);
            throw error;
        }
    }

    /**
     * Desuscribirse de notificaciones push
     */
    async unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                
                // Notificar al servidor
                const token = localStorage.getItem('token');
                if (token) {
                    await fetch(`${this.apiUrl}/api/push/unsubscribe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            endpoint: subscription.endpoint
                        })
                    });
                }

                this.subscription = null;
                console.log('✅ Desuscripción completada');
            }
        } catch (error) {
            console.error('❌ Error desuscribiéndose:', error);
            throw error;
        }
    }

    /**
     * Convertir clave VAPID de base64 a Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Convertir ArrayBuffer a base64
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Verificar si las notificaciones están habilitadas
     */
    isEnabled() {
        return this.subscription !== null && Notification.permission === 'granted';
    }
}

// Crear instancia global
window.pushNotifications = new PushNotifications();

// Inicializar cuando el usuario esté autenticado
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que el usuario se autentique
    const checkAuth = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token) {
            clearInterval(checkAuth);
            // Inicializar notificaciones push después de un breve delay
            setTimeout(() => {
                window.pushNotifications.init().catch(err => {
                    console.error('Error inicializando push notifications:', err);
                });
            }, 2000);
        }
    }, 1000);

    // Limpiar intervalo después de 30 segundos
    setTimeout(() => clearInterval(checkAuth), 30000);
});

