// Declaraciones de tipos globales para el proyecto

declare global {
  interface Window {
    // Variables globales
    currentUser: any;
    currentRoute: string;
    currentPedidos: any[];
    allPedidos: any[];
    currentProducts: any[];
    currentClients: any[];
    availableZonas: any[];
    currentFilters: { fecha: string; zona: string; search: string };
    
    // Timeouts
    pedidosSearchTimeout: any;
    searchTimeout: any;
    clientSearchTimeout: any;
    editingProductId: any;
    
    // Modales
    productModal: any;
    clientModal: any;
    orderModal: any;
    mapModal: any;
    deliveryModal: any;
    
    // Event bus
    eventBus: any;
    EVENTS: any;
    
    // Funciones globales
    trySetupEventListeners: () => void;
    setCurrentClients: (clients: any[]) => void;
    
    // Funciones de productos
    showCreateProductModal: () => void;
    deleteProductInline: (productId: any) => void;
    activateProductInline: (productId: any) => void;
    closeProductModal: () => void;
    handleProductSubmit: (e: any) => void;
    searchProducts: (searchTerm: string) => void;
    renderProductsList: (productos: any[]) => void;
    editProductInline: (productId: any) => void;
    deleteProduct: (productId: any) => void;
    editProduct: (productId: any) => void;
    loadProductosData: () => void;
    filterProductosByEstado: () => void;
    applyProductFilters: () => void;
    clearProductosFilters: () => void;
    
    // Funciones de clientes
    searchClients: (searchTerm: string) => void;
    debounceSearchClients: (searchTerm: string) => void;
    clearClientSearch: () => void;
    editClient: (clientId: any) => void;
    showClientLocation: (clientId: any) => void;
    showClientAccount: (clientId: any) => void;
    deleteClient: (clientId: any) => void;
    showCreateClientModal: () => void;
    
    // Funciones de pedidos
    clearPedidosFilters: () => void;
    viewPedido: (pedidoId: any) => void;
    editPedido: (pedidoId: any) => void;
    entregarPedido: (pedidoId: any) => void;
    getPedidoItems: (pedidoId: any) => any[];
    filterPedidos: () => void;
    showCreateOrderModal: () => void;
    showMapModal: () => void;
    
    // Funciones de utilidad
    debounceSearch: (searchTerm: string) => void;
    clearSearch: () => void;
    showSuccessMessage: (message: string) => void;
    showErrorMessage: (message: string) => void;
  }
}

// Declaraciones de funciones globales (no en window)
declare function clearPedidosFilters(): void;
declare function filterPedidos(): void;
declare function viewPedido(pedidoId: any): void;
declare function getPedidoItems(pedidoId: any): any[];
declare function entregarPedido(pedidoId: any): void;
declare function showMapModal(): void;
declare function showCreateOrderModal(): void;
declare function showSuccessMessage(message: string): void;
declare function showErrorMessage(message: string): void;
declare function deleteProduct(productId: any): void;
declare function editProduct(productId: any): void;
declare function searchProducts(searchTerm: string): void;
declare function filterProductosByEstado(): void;
declare function applyProductFilters(): void;
declare function clearProductosFilters(): void;
declare function activateProductInline(productId: any): void;
declare function renderProductsList(productos: any[]): void;
declare function loadProductosData(): void;
declare function searchClients(searchTerm: string): void;
declare function debounceSearchClients(searchTerm: string): void;
declare function clearClientSearch(): void;
declare function editClient(clientId: any): void;
declare function showClientLocation(clientId: any): void;
declare function showClientAccount(clientId: any): void;
declare function deleteClient(clientId: any): void;
declare function showCreateClientModal(): void;
declare function debounceSearch(searchTerm: string): void;
declare function clearSearch(): void;

export {};
