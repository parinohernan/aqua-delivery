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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">Nuevo Pedido</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                
                {showClientDropdown && filteredClientes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                    {filteredClientes.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => handleSelectCliente(cliente)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium">{formatFullName(cliente.nombre, cliente.apellido)}</div>
                        <div className="text-sm text-gray-600">
                          {cliente.telefono} • {cliente.direccion}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {formatFullName(selectedCliente.nombre, selectedCliente.apellido)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedCliente.telefono} • {selectedCliente.direccion}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCliente}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Agregar Productos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Productos del Pedido
            </label>
            
            <div className="flex gap-2 mb-4">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleccionar producto...</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
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
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                + Agregar
              </button>
            </div>

            {/* Lista de Productos */}
            {orderItems.length === 0 ? (
              <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-500">No hay productos agregados al pedido</p>
                <p className="text-sm text-gray-400 mt-1">Selecciona productos arriba para agregarlos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {item.producto.descripcion || item.producto.nombre}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.precio)} x {item.cantidad}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(index, item.cantidad - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-medium">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(index, item.cantidad + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="w-24 text-right font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total del Pedido:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>📋 Información:</strong> El pedido se creará con estado "Pendient".
              El tipo de pago se definirá durante la entrega. El stock de los productos se actualizará automáticamente.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

