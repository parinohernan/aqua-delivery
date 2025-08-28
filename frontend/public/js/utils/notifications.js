// Sistema de notificaciones elegante para reemplazar los alerts nativos
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear el contenedor de notificaciones
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    // Función principal para mostrar notificaciones
    show(message, type = 'info', duration = 5000) {
        if (!this.container) {
            this.init();
        }

        // Crear la notificación
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 0.9rem;
            line-height: 1.4;
            position: relative;
            overflow: hidden;
            pointer-events: auto;
        `;

        // Icono y título según el tipo
        const { icon, title } = this.getTypeInfo(type);

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                <span style="font-size: 1.2rem; flex-shrink: 0;">${icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">
                        ${title}
                    </div>
                    <div>${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s ease;
                    flex-shrink: 0;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">×</button>
            </div>
        `;

        // Agregar al contenedor
        this.container.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);

        return notification;
    }

    // Obtener color de fondo según el tipo
    getBackgroundColor(type) {
        switch (type) {
            case 'success':
                return 'linear-gradient(135deg, #10b981, #059669)';
            case 'error':
                return 'linear-gradient(135deg, #ef4444, #dc2626)';
            case 'warning':
                return 'linear-gradient(135deg, #f59e0b, #d97706)';
            case 'info':
            default:
                return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
        }
    }

    // Obtener información del tipo
    getTypeInfo(type) {
        switch (type) {
            case 'success':
                return { icon: '✅', title: 'Éxito' };
            case 'error':
                return { icon: '❌', title: 'Error' };
            case 'warning':
                return { icon: '⚠️', title: 'Advertencia' };
            case 'info':
            default:
                return { icon: 'ℹ️', title: 'Información' };
        }
    }

    // Funciones de conveniencia
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 8000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Sistema de confirmaciones elegante
class ConfirmSystem {
    show(message, onConfirm, onCancel = null) {
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        // Crear modal de confirmación
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s ease;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        `;

        modal.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.25rem;">Confirmar acción</h3>
                <p style="margin: 0 0 2rem 0; color: #6b7280; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="confirm-cancel" style="
                        padding: 0.75rem 1.5rem;
                        border: 2px solid #e5e7eb;
                        background: white;
                        color: #6b7280;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.borderColor='#d1d5db'" onmouseout="this.style.borderColor='#e5e7eb'">Cancelar</button>
                    <button id="confirm-ok" style="
                        padding: 0.75rem 1.5rem;
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">Confirmar</button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animación de entrada
        setTimeout(() => {
            modal.style.transform = 'scale(1)';
            modal.style.opacity = '1';
        }, 10);

        // Event listeners
        const confirmBtn = modal.querySelector('#confirm-ok');
        const cancelBtn = modal.querySelector('#confirm-cancel');

        const closeModal = () => {
            modal.style.transform = 'scale(0.9)';
            modal.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentElement) {
                    overlay.remove();
                }
            }, 300);
        };

        confirmBtn.addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        // Cerrar al hacer clic fuera del modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                if (onCancel) onCancel();
            }
        });

        // Cerrar con Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                if (onCancel) onCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
}

// Instancias globales
window.notifications = new NotificationSystem();
window.confirmDialog = new ConfirmSystem();

// Funciones de conveniencia globales
window.showSuccess = (message, duration) => window.notifications.success(message, duration);
window.showError = (message, duration) => window.notifications.error(message, duration);
window.showWarning = (message, duration) => window.notifications.warning(message, duration);
window.showInfo = (message, duration) => window.notifications.info(message, duration);
window.showConfirm = (message, onConfirm, onCancel) => window.confirmDialog.show(message, onConfirm, onCancel);

console.log('🔔 Sistema de notificaciones inicializado');
