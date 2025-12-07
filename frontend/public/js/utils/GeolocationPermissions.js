/**
 * GeolocationPermissions - Gestión de permisos de geolocalización y notificaciones
 * Responsabilidad: Solicitar, verificar y manejar permisos del navegador
 */
class GeolocationPermissions {
    constructor() {
        this.permissions = {
            geolocation: 'prompt',
            notifications: 'default'
        };
    }

    /**
     * Verifica el estado actual de todos los permisos
     * @returns {Promise<Object>} Estado de permisos
     */
    async checkPermissions() {
        const status = {
            geolocation: 'prompt',
            notifications: Notification.permission,
            allGranted: false
        };

        // Verificar geolocalización
        if ('permissions' in navigator) {
            try {
                const geoPermission = await navigator.permissions.query({ name: 'geolocation' });
                status.geolocation = geoPermission.state;
            } catch (e) {
                console.warn('⚠️ No se puede verificar permiso de geolocalización:', e);
            }
        }

        status.allGranted = status.geolocation === 'granted' && status.notifications === 'granted';

        console.log('📋 Estado de permisos:', status);
        return status;
    }

    /**
     * Solicita permiso de geolocalización
     * @returns {Promise<boolean>} True si se otorgó el permiso
     */
    async requestLocationPermission() {
        console.log('📍 Solicitando permiso de geolocalización...');

        if (!('geolocation' in navigator)) {
            throw new Error('Tu navegador no soporta geolocalización');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('✅ Permiso de geolocalización otorgado');
                    this.permissions.geolocation = 'granted';
                    resolve(true);
                },
                (error) => {
                    console.error('❌ Permiso de geolocalización denegado:', error);
                    this.permissions.geolocation = 'denied';

                    let errorMessage = 'No se pudo obtener permiso de ubicación';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permiso de ubicación denegado. Por favor, habilítalo en la configuración del navegador.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Información de ubicación no disponible.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
                            break;
                    }

                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    /**
     * Solicita permiso de notificaciones
     * @returns {Promise<boolean>} True si se otorgó el permiso
     */
    async requestNotificationPermission() {
        console.log('🔔 Solicitando permiso de notificaciones...');

        if (!('Notification' in window)) {
            throw new Error('Tu navegador no soporta notificaciones');
        }

        if (Notification.permission === 'granted') {
            console.log('✅ Permiso de notificaciones ya otorgado');
            this.permissions.notifications = 'granted';
            return true;
        }

        if (Notification.permission === 'denied') {
            throw new Error('Permiso de notificaciones denegado. Por favor, habilítalo en la configuración del navegador.');
        }

        try {
            const permission = await Notification.requestPermission();
            this.permissions.notifications = permission;

            if (permission === 'granted') {
                console.log('✅ Permiso de notificaciones otorgado');
                return true;
            } else {
                throw new Error('Permiso de notificaciones denegado');
            }
        } catch (error) {
            console.error('❌ Error solicitando permiso de notificaciones:', error);
            throw error;
        }
    }

    /**
     * Solicita todos los permisos necesarios
     * @returns {Promise<Object>} Resultado de permisos
     */
    async requestAllPermissions() {
        console.log('🔐 Solicitando todos los permisos...');

        const results = {
            geolocation: false,
            notifications: false,
            success: false,
            errors: []
        };

        // Solicitar geolocalización
        try {
            results.geolocation = await this.requestLocationPermission();
        } catch (error) {
            results.errors.push({ type: 'geolocation', message: error.message });
        }

        // Solicitar notificaciones
        try {
            results.notifications = await this.requestNotificationPermission();
        } catch (error) {
            results.errors.push({ type: 'notifications', message: error.message });
        }

        results.success = results.geolocation && results.notifications;

        if (results.success) {
            console.log('✅ Todos los permisos otorgados');
        } else {
            console.warn('⚠️ Algunos permisos no fueron otorgados:', results.errors);
        }

        return results;
    }

    /**
     * Muestra instrucciones para habilitar permisos
     * @param {string} permissionType - Tipo de permiso ('geolocation' o 'notifications')
     */
    showPermissionInstructions(permissionType) {
        const instructions = {
            geolocation: {
                title: '📍 Permiso de Ubicación Requerido',
                message: `Para usar el tracking GPS, necesitas habilitar el permiso de ubicación:
        
1. Haz clic en el ícono de candado/información en la barra de direcciones
2. Busca "Ubicación" o "Location"
3. Selecciona "Permitir"
4. Recarga la página`,
                icon: '📍'
            },
            notifications: {
                title: '🔔 Permiso de Notificaciones Requerido',
                message: `Para recibir alertas de proximidad, necesitas habilitar las notificaciones:
        
1. Haz clic en el ícono de candado/información en la barra de direcciones
2. Busca "Notificaciones" o "Notifications"
3. Selecciona "Permitir"
4. Recarga la página`,
                icon: '🔔'
            }
        };

        const instruction = instructions[permissionType];
        if (!instruction) return;

        // Mostrar modal con instrucciones
        if (window.showNotification) {
            window.showNotification(instruction.message, 'warning');
        } else {
            alert(`${instruction.title}\n\n${instruction.message}`);
        }
    }

    /**
     * Verifica si todos los permisos están otorgados
     * @returns {Promise<boolean>}
     */
    async hasAllPermissions() {
        const status = await this.checkPermissions();
        return status.allGranted;
    }

    /**
     * Muestra modal explicativo antes de solicitar permisos
     * @returns {Promise<boolean>} True si el usuario acepta continuar
     */
    async showPermissionExplanation() {
        return new Promise((resolve) => {
            const modalHTML = `
        <div id="permissionsExplanationModal" class="modal-overlay show">
          <div class="modal-content" style="max-width: 500px;">
            <h3 style="margin: 0 0 1rem 0; color: #111827;">🎯 Tracking GPS de Entregas</h3>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 1rem;">
              Para usar el tracking automático de entregas, necesitamos dos permisos:
            </p>
            
            <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div style="display: flex; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">📍</span>
                <div>
                  <strong style="color: #111827;">Ubicación GPS</strong>
                  <p style="margin: 0.25rem 0 0 0; color: #6b7280; font-size: 0.875rem;">
                    Para calcular tu distancia a los destinos de entrega
                  </p>
                </div>
              </div>
              
              <div style="display: flex; gap: 0.75rem;">
                <span style="font-size: 1.5rem;">🔔</span>
                <div>
                  <strong style="color: #111827;">Notificaciones</strong>
                  <p style="margin: 0.25rem 0 0 0; color: #6b7280; font-size: 0.875rem;">
                    Para avisarte cuando estés cerca de un destino
                  </p>
                </div>
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem;">
              💡 Puedes desactivar el tracking en cualquier momento
            </p>
            
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
              <button id="cancelPermissions" class="btn-secondary">
                Cancelar
              </button>
              <button id="acceptPermissions" class="btn-primary">
                Continuar
              </button>
            </div>
          </div>
        </div>
      `;

            // Agregar modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const modal = document.getElementById('permissionsExplanationModal');
            const acceptBtn = document.getElementById('acceptPermissions');
            const cancelBtn = document.getElementById('cancelPermissions');

            const cleanup = () => {
                modal.remove();
            };

            acceptBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
        });
    }
}

// Crear instancia global
window.geolocationPermissions = new GeolocationPermissions();
window.GeolocationPermissions = GeolocationPermissions;

console.log('✅ GeolocationPermissions module loaded');
