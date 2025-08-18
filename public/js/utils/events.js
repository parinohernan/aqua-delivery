// Sistema de eventos global para comunicación entre componentes
class EventBus {
    constructor() {
        this.events = {};
    }

    // Suscribirse a un evento
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // Desuscribirse de un evento
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    // Emitir un evento
    emit(event, data) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error en evento ${event}:`, error);
            }
        });
    }

    // Limpiar todos los eventos
    clear() {
        this.events = {};
    }
}

// Instancia global del bus de eventos
window.eventBus = new EventBus();

// Eventos predefinidos del sistema
window.EVENTS = {
    PEDIDO_CREATED: 'pedido:created',
    PEDIDO_UPDATED: 'pedido:updated',
    PEDIDO_DELETED: 'pedido:deleted',
    CLIENTE_CREATED: 'cliente:created',
    CLIENTE_UPDATED: 'cliente:updated',
    CLIENTE_DELETED: 'cliente:deleted',
    PRODUCTO_CREATED: 'producto:created',
    PRODUCTO_UPDATED: 'producto:updated',
    PRODUCTO_DELETED: 'producto:deleted'
};

console.log('📡 Sistema de eventos inicializado');
