// Declaraciones de tipos globales para el proyecto

declare global {
  interface Window {
    // Variables globales
    currentUser: User | null;
    currentRoute: string;
    currentPedidos: any[];
    allPedidos: any[];
    currentProducts: any[];
    currentClients: any[];
    currentClientes: any[];
    availableZonas: any[];
    currentFilters: { fecha: string; zona: string; search: string };
    
    // Timeouts
    pedidosSearchTimeout: any;
    searchTimeout: any;
    clientSearchTimeout: any;
    editingProductId: any;
    
    // Modales
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
    
    // Funciones de informes
    generarInforme: () => Promise<void>;
    informeDetalladoData: any;
    
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
    loadClientesSection: () => Promise<void>;
    loadClientesData: () => Promise<void>;
    setupClientesEventListeners: () => void;
    
    // Funciones de pedidos
    loadPedidosSection: () => Promise<void>;
    loadPedidosData: () => Promise<void>;
    setupPedidosEventListeners: () => void;
    applyPedidoFilters: () => Promise<void>;
    clearPedidoFilters: () => void;
    viewPedido: (pedidoId: any) => void;
    editPedido: (pedidoId: any) => void;
    startDelivery: (pedidoId: any) => void;
    completeDelivery: (pedidoId: any) => void;
    cancelPedido: (pedidoId: any) => void;
    updatePedidoStatus: (pedidoId: any, newStatus: string) => Promise<void>;
    exportPedidos: () => void;
    showDeliveryMap: () => void;
    showPedidoDetails: (pedidoId: any) => void;
    showEditPedidoModal: (pedidoId: any) => void;
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
    showSuccess: (message: string) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
    showConfirm: (message: string, onConfirm: () => void) => void;
    
    // Funciones de desarrollo y diagnóstico
    enableDevMode: () => void;
    disableDevMode: () => void;
    diagnosticar: () => void;
    debugTipoPago: (tipoPagoId: any) => Promise<any>;
    
    // Funciones de pagos
    showClientPayment: (clienteId: any) => void;
    closePaymentModal: () => void;
    processClientPayment: (clienteId: any, monto: number, tipoPago: string) => Promise<void>;
    
    // Funciones de clientes (modal)
    handleClientSubmit: (e: any) => Promise<void>;
    showEditClientModal: (cliente: any) => void;
    closeClientModal: () => void;
    setupClientEventListeners: () => void;
    
    // Funciones de filtros
    toggleAdvancedFilters: () => void;
    
    // Funciones de búsqueda
    searchClientes: (searchTerm: string) => Promise<void>;
    filterClientesBySaldo: (saldo: string) => Promise<void>;
    filterClientesByRetornables: (retornables: string) => Promise<void>;
    clearClientesFilters: () => void;
    
    // Funciones de edición inline
    editClienteInline: (clientId: any) => void;
    viewClienteInline: (clientId: any) => void;
    toggleClienteStatus: (clientId: any) => Promise<void>;
    
    // Funciones de productos (modal)
    showEditProductModal: (producto: any) => void;
    closeProductModal: () => void;
    setupProductEventListeners: () => void;
    
    // Funciones de zonas
    loadZonas: () => Promise<void>;
    updateZonaFilter: () => void;
    
    // Funciones de autenticación
    logout: () => void;
    checkAuth: () => Promise<void>;
    showMainApp: () => void;
    loadRoute: (route: string) => void;
    redirectToLogin: () => void;
    
    // Funciones de modal de logout
    showLogoutModal: () => void;
    hideLogoutModal: () => void;
    performLogout: () => void;
    
    // Funciones de mapa de entregas
    showDeliveryMap: () => Promise<void>;
    closeDeliveryMap: () => void;
    initMapPWA: (containerId: string, options?: any) => Promise<any>;
    
    // Funciones de inicialización de secciones
    initPedidosSection: () => Promise<void>;
    initClientesSection: () => Promise<void>;
    initProductosSection: () => Promise<void>;
    initInformesSection: () => Promise<void>;
    
    // Variables de mapa
    deliveryMap: any;
    deliveryMarkers: any[];
    
    // API Config
    API_CONFIG: {
      BASE_URL: string;
      ENDPOINTS: {
        LOGIN: string;
        CLIENTES: string;
        PRODUCTOS: string;
        PEDIDOS: string;
        PAGOS: string;
        ZONAS: string;
        TIPOS_PAGO: string;
        INFORMES: string;
      };
      getUrl: (endpoint: string) => string;
      getEndpointUrl: (endpointName: string) => string;
    };
  }

  // Extender HTMLElement para incluir propiedades comunes
  interface HTMLElement {
    value?: string | number;
    checked?: boolean;
    selected?: boolean;
    selectedIndex?: number;
    options?: HTMLOptionsCollection;
    style?: CSSStyleDeclaration;
    matches?: (selector: string) => boolean;
    closest?: (selector: string) => HTMLElement | null;
  }
  
  // Tipo para usuario
  interface User {
    nombre?: string;
    telegramId?: string;
    [key: string]: any;
  }
  
  // Tipo para Leaflet
  interface LeafletMap {
    remove: () => void;
    invalidateSize: () => void;
    fitBounds: (bounds: any, options?: any) => void;
    [key: string]: any;
  }
  
  // Declarar Leaflet global
  const L: {
    divIcon: (options: any) => any;
    marker: (latlng: [number, number], options?: any) => any;
    featureGroup: (layers?: any[]) => any;
    [key: string]: any;
  };
}

// Declarar tipos para errores
declare type Error = {
  message: string;
  name?: string;
  stack?: string;
  [key: string]: any;
};

// Declarar User fuera del bloque global para uso en código
declare type User = {
  nombre?: string;
  telegramId?: string;
  [key: string]: any;
};

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

// Funciones adicionales que se usan en el código
declare function generarInforme(): Promise<void>;
declare function loadClientesSection(): Promise<void>;
declare function loadClientesData(): Promise<void>;
declare function setupClientesEventListeners(): void;
declare function searchClientes(searchTerm: string): Promise<void>;
declare function filterClientesBySaldo(saldo: string): Promise<void>;
declare function filterClientesByRetornables(retornables: string): Promise<void>;
declare function clearClientesFilters(): void;
declare function editClienteInline(clientId: any): void;
declare function viewClienteInline(clientId: any): void;
declare function toggleClienteStatus(clientId: any): Promise<void>;
declare function handleClientSubmit(e: any): Promise<void>;
declare function showEditClientModal(cliente: any): void;
declare function closeClientModal(): void;
declare function setupClientEventListeners(): void;
declare function loadZonas(): Promise<void>;
declare function updateZonaFilter(): void;
declare function toggleAdvancedFilters(): void;
declare function logout(): void;
declare function checkAuth(): Promise<void>;
declare function showMainApp(): void;
declare function loadRoute(route: string): void;
declare function redirectToLogin(): void;
declare function showSuccess(message: string): void;
declare function showError(message: string, duration?: number): void;
declare function showWarning(message: string): void;
declare function showInfo(message: string): void;
declare function showConfirm(message: string, onConfirm: () => void): void;
declare function enableDevMode(): void;
declare function disableDevMode(): void;
declare function diagnosticar(): void;
declare function debugTipoPago(tipoPagoId: any): Promise<any>;
declare function showClientPayment(clienteId: any): void;
declare function closePaymentModal(): void;
declare function processClientPayment(clienteId: any, monto: number, tipoPago: string): Promise<void>;
declare function showEditProductModal(producto: any): void;
declare function closeProductModal(): void;
declare function setupProductEventListeners(): void;
declare function loadPedidosSection(): Promise<void>;
declare function loadPedidosData(): Promise<void>;
declare function setupPedidosEventListeners(): void;
declare function applyPedidoFilters(): Promise<void>;
declare function clearPedidoFilters(): void;
declare function startDelivery(pedidoId: any): void;
declare function completeDelivery(pedidoId: any): void;
declare function cancelPedido(pedidoId: any): void;
declare function updatePedidoStatus(pedidoId: any, newStatus: string): Promise<void>;
declare function exportPedidos(): void;
declare function showDeliveryMap(): void;
declare function showPedidoDetails(pedidoId: any): void;
declare function showEditPedidoModal(pedidoId: any): void;
declare function showCreateOrderModal(): void;
declare function showCreateProductModal(): void;
declare function deleteProductInline(productId: any): void;
declare function activateProductInline(productId: any): void;
declare function handleProductSubmit(e: any): void;
declare function editProductInline(productId: any): void;
declare function filterProductosByEstado(): void;
declare function applyProductFilters(): void;
declare function clearProductosFilters(): void;
declare function trySetupEventListeners(): void;
declare function setCurrentClients(clients: any[]): void;

// Tipos de utilidad para elementos HTML
declare type HTMLFormElement = {
  elements: HTMLFormControlsCollection;
  length: number;
  name: string;
  method: string;
  target: string;
  action: string;
  encoding: string;
  enctype: string;
  acceptCharset: string;
  autocomplete: string;
  noValidate: boolean;
  submit(): void;
  reset(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
};

declare type HTMLFormControlsCollection = {
  [key: string]: HTMLFormElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  length: number;
  [index: number]: HTMLFormElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
};

declare type HTMLOptionsCollection = {
  [key: string]: HTMLOptionElement;
  length: number;
  [index: number]: HTMLOptionElement;
  add(element: HTMLOptionElement, before?: HTMLOptionElement | number): void;
  remove(index: number): void;
  selectedIndex: number;
};

declare type ValidityState = {
  valueMissing: boolean;
  typeMismatch: boolean;
  patternMismatch: boolean;
  tooLong: boolean;
  tooShort: boolean;
  rangeUnderflow: boolean;
  rangeOverflow: boolean;
  stepMismatch: boolean;
  badInput: boolean;
  customError: boolean;
  valid: boolean;
};

declare type FileList = {
  [index: number]: File;
  length: number;
  item(index: number): File | null;
};

declare type File = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  lastModifiedDate: Date;
  webkitRelativePath: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream;
  text(): Promise<string>;
};

export {};
