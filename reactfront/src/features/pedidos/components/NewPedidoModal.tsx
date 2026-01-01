import { useState, useEffect, useRef } from 'react';
import { usePedidosStore } from '../stores/pedidosStore';
import { clientesService } from '@/features/clientes/services/clientesService';
import { productosService } from '@/features/productos/services/productosService';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { formatCurrency, formatFullName } from '@/utils/formatters';
import type { Cliente, Producto } from '@/types/entities';

/**
 * Item de producto en el pedido
 */
interface PedidoItem {
  productoId: number;
  producto: Producto;
  cantidad: number;
  precio: number;
  subtotal: number;
}

/**
 * Modal para crear nuevo pedido
 */
interface NewPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NewPedidoModal({ isOpen, onClose }: NewPedidoModalProps) {
  const { loadPedidos } = usePedidosStore();
  
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [zonas, setZonas] = useState<Array<{ id: number; nombre: string }>>([]);
  
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<PedidoItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clientSearchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Filtrar clientes cuando cambia la búsqueda
  useEffect(() => {
    if (clientSearch.trim()) {
      const filtered = clientes.filter(cliente => {
        const nombre = formatFullName(cliente.nombre, cliente.apellido).toLowerCase();
        const telefono = cliente.telefono?.toLowerCase() || '';
        const searchLower = clientSearch.toLowerCase();
        return nombre.includes(searchLower) || telefono.includes(searchLower);
      });
      setFilteredClientes(filtered);
      setShowClientDropdown(filtered.length > 0);
    } else {
      setFilteredClientes([]);
      setShowClientDropdown(false);
    }
  }, [clientSearch, clientes]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        clientSearchRef.current &&
        !clientSearchRef.current.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [clientesData, productosData, zonasData] = await Promise.all([
        clientesService.getAll(),
        productosService.getAll(),
        apiClient.get<Array<{ id: number; nombre: string }>>(endpoints.zonas()),
      ]);

      setClientes(clientesData);
      setProductos(productosData.filter(p => p.activo !== false));
      setZonas(zonasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error cargando datos iniciales');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClientSearch('');
    setShowClientDropdown(false);
  };

  const handleClearCliente = () => {
    setSelectedCliente(null);
    setClientSearch('');
  };

  const handleAddProduct = () => {
    if (!selectedProductId || productQuantity < 1) {
      alert('Selecciona un producto y cantidad válida');
      return;
    }

    const producto = productos.find(p => p.id === Number(selectedProductId));
    if (!producto) return;

    // Verificar si el producto ya está en el pedido
    const existingIndex = orderItems.findIndex(item => item.productoId === producto.id);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad del producto existente
      const updatedItems = [...orderItems];
      updatedItems[existingIndex].cantidad += productQuantity;
      updatedItems[existingIndex].subtotal = updatedItems[existingIndex].cantidad * updatedItems[existingIndex].precio;
      setOrderItems(updatedItems);
    } else {
      // Agregar nuevo producto
      const precio = producto.precio || 0;
      const newItem: PedidoItem = {
        productoId: producto.id,
        producto,
        cantidad: productQuantity,
        precio,
        subtotal: precio * productQuantity,
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Resetear selección
    setSelectedProductId('');
    setProductQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleUpdateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...orderItems];
    updatedItems[index].cantidad = newQuantity;
    updatedItems[index].subtotal = updatedItems[index].cantidad * updatedItems[index].precio;
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCliente) {
      setError('Debes seleccionar un cliente');
      return;
    }

    if (orderItems.length === 0) {
      setError('Debes agregar al menos un producto al pedido');
      return;
    }

    try {
      setIsLoading(true);

      // El backend espera clienteId y productoId como códigos (no IDs numéricos)
      const pedidoData = {
        clienteId: selectedCliente.codigo || selectedCliente.id,
        productos: orderItems.map(item => ({
          productoId: item.producto.codigo || item.producto.id,
          cantidad: item.cantidad,
          precio: item.precio,
        })),
        total: calculateTotal(),
      };
      
      console.log('📦 Creando pedido con datos:', pedidoData);

      await apiClient.post(endpoints.pedidos(), pedidoData);
      
      // Recargar pedidos
      await loadPedidos();
      
      // Cerrar modal y resetear
      handleClose();
      alert('Pedido creado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creando pedido';
      setError(errorMessage);
      console.error('Error creando pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCliente(null);
    setClientSearch('');
    setOrderItems([]);
    setSelectedProductId('');
    setProductQuantity(1);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0f1b2e] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/20 w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto z-[101]">
        <div className="sticky top-0 bg-[#0f1b2e] backdrop-blur-xl border-b-2 border-white/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h3 className="text-lg sm:text-xl font-bold text-white">Nuevo Pedido</h3>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white text-2xl sm:text-3xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Selección de Cliente */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Cliente *
            </label>
            
            {!selectedCliente ? (
              <div className="relative" ref={dropdownRef}>
                <input
                  ref={clientSearchRef}
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar cliente por nombre..."
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm"
                />
                
                {showClientDropdown && filteredClientes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f1b2e]/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-20">
                    {filteredClientes.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => handleSelectCliente(cliente)}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-white"
                      >
                        <div className="font-medium">{formatFullName(cliente.nombre, cliente.apellido)}</div>
                        <div className="text-sm text-white/70">
                          {cliente.telefono} • {cliente.direccion}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-primary-500/20 border border-primary-500/50 rounded-lg backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {formatFullName(selectedCliente.nombre, selectedCliente.apellido)}
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                      {selectedCliente.telefono} • {selectedCliente.direccion}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCliente}
                    className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded hover:bg-red-500/30 transition-colors backdrop-blur-sm"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Agregar Productos */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Productos del Pedido
            </label>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white backdrop-blur-sm"
              >
                <option value="" className="bg-[#0f1b2e]">Seleccionar producto...</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id} className="bg-[#0f1b2e]">
                    {producto.descripcion || producto.nombre} - {formatCurrency(producto.precio || 0)} (Stock: {producto.stock || 0})
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(Number(e.target.value))}
                min="1"
                placeholder="Cant."
                className="w-full sm:w-20 px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm"
              />
              
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-4 py-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg hover:from-primary-500 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
              >
                + Agregar
              </button>
            </div>

            {/* Lista de Productos */}
            {orderItems.length === 0 ? (
              <div className="p-8 text-center border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm">
                <p className="text-white/70">No hay productos agregados al pedido</p>
                <p className="text-sm text-white/50 mt-1">Selecciona productos arriba para agregarlos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {item.producto.descripcion || item.producto.nombre}
                      </div>
                      <div className="text-sm text-white/70">
                        {formatCurrency(item.precio)} x {item.cantidad}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(index, item.cantidad - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-medium text-white">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(index, item.cantidad + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="w-24 text-right font-semibold text-white">
                        {formatCurrency(item.subtotal)}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 rounded hover:bg-red-500/30 transition-colors backdrop-blur-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="mt-4 p-4 bg-primary-500/20 border border-primary-500/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Total del Pedido:</span>
                <span className="text-2xl font-bold text-primary-300">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="p-4 bg-primary-500/20 border border-primary-500/50 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-white/90">
              <strong>📋 Información:</strong> El pedido se creará con estado "Pendient".
              El tipo de pago se definirá durante la entrega. El stock de los productos se actualizará automáticamente.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg hover:from-primary-500 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
            >
              {isLoading ? 'Creando...' : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPedidoModal;

