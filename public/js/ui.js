// ===== SISTEMA DE UI MODERNO =====

class UIManager {
    constructor() {
        this.toastContainer = document.getElementById('toast-container');
        this.init();
    }

    init() {
        // Inicializar iconos Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Configurar navegación
        this.setupNavigation();
        
        // Configurar eventos globales
        this.setupGlobalEvents();
    }

    // ===== NAVEGACIÓN =====
    setupNavigation() {
        // Navegación desktop
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setActiveNavButton(e.target, 'nav-button');
            });
        });

        // Navegación móvil
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveNavButton(e.currentTarget, 'bottom-nav-item');
            });
        });
    }

    setActiveNavButton(clickedElement, className) {
        // Remover active de todos los elementos
        document.querySelectorAll(`.${className}`).forEach(el => {
            el.classList.remove('active');
        });
        
        // Agregar active al elemento clickeado
        clickedElement.classList.add('active');
        
        // Sincronizar entre navegación desktop y móvil
        const route = clickedElement.dataset.route;
        if (route) {
            document.querySelectorAll(`[data-route="${route}"]`).forEach(el => {
                el.classList.add('active');
            });
        }
    }

    // ===== EVENTOS GLOBALES =====
    setupGlobalEvents() {
        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // ===== TOAST NOTIFICATIONS =====
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type} slide-up`;
        
        const toastId = 'toast-' + Date.now();
        toast.id = toastId;
        
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">${this.getToastTitle(type)}</div>
                <button class="toast-close" onclick="ui.closeToast('${toastId}')">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Inicializar iconos en el toast
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Auto-cerrar después del tiempo especificado
        setTimeout(() => {
            this.closeToast(toastId);
        }, duration);
        
        return toastId;
    }

    getToastTitle(type) {
        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        return titles[type] || 'Notificación';
    }

    closeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }

    // ===== MODALES =====
    showModal(title, content, actions = []) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = 'current-modal';
        
        modalOverlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="ui.closeModal()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${actions.length > 0 ? `
                    <div class="modal-footer">
                        ${actions.map(action => `
                            <button class="btn ${action.class || 'btn-secondary'}" 
                                    onclick="${action.onclick || ''}"
                                    ${action.disabled ? 'disabled' : ''}>
                                ${action.icon ? `<i data-lucide="${action.icon}"></i>` : ''}
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        
        // Inicializar iconos en el modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        return modalOverlay;
    }

    closeModal() {
        const modal = document.getElementById('current-modal');
        if (modal) {
            modal.remove();
        }
    }

    // ===== CONFIRMACIÓN =====
    showConfirm(title, message, onConfirm, onCancel = null) {
        const actions = [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: `ui.closeModal(); ${onCancel ? onCancel + '()' : ''}`
            },
            {
                text: 'Confirmar',
                class: 'btn-primary',
                icon: 'check',
                onclick: `ui.closeModal(); ${onConfirm}()`
            }
        ];
        
        return this.showModal(title, `<p>${message}</p>`, actions);
    }

    // ===== LOADING =====
    showLoading(message = 'Cargando...') {
        const loading = document.createElement('div');
        loading.className = 'modal-overlay';
        loading.id = 'loading-modal';
        
        loading.innerHTML = `
            <div class="modal" style="max-width: 300px;">
                <div class="modal-body text-center">
                    <div class="spinner" style="margin: 0 auto var(--spacing-4) auto;"></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(loading);
        return loading;
    }

    hideLoading() {
        const loading = document.getElementById('loading-modal');
        if (loading) {
            loading.remove();
        }
    }

    // ===== UTILIDADES =====
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    // ===== ANIMACIONES =====
    animateElement(element, animation = 'fade-in') {
        element.classList.add(animation);
        
        // Remover la clase después de la animación
        setTimeout(() => {
            element.classList.remove(animation);
        }, 300);
    }

    // ===== RESPONSIVE HELPERS =====
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }
}

// Inicializar el sistema de UI
const ui = new UIManager();

// Exportar para uso global
window.ui = ui;
