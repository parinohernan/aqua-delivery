import { useState, useEffect } from 'react';
import { useProductosStore } from '../stores/productosStore';
import type { Producto } from '@/types/entities';

/**
 * Modal para crear o editar un producto
 */
interface ProductoModalProps {
  isOpen: boolean;
  producto: Producto | null; // null para crear, Producto para editar
  onClose: () => void;
}

function ProductoModal({ isOpen, producto, onClose }: ProductoModalProps) {
  const { createProducto, updateProducto, loadProductos } = useProductosStore();
  
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [imageURL, setImageURL] = useState<string>('');
  const [esRetornable, setEsRetornable] = useState(false);
  const [activo, setActivo] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (producto) {
        // Modo edición: cargar datos del producto
        setDescripcion(producto.descripcion || producto.nombre || '');
        setPrecio(producto.precio?.toString() || '');
        setStock(producto.stock?.toString() || '');
        setImageURL(producto.imagen || producto.imageURL || '');
        setEsRetornable(producto.esRetornable === true || producto.esRetornable === 1);
        setActivo(producto.activo !== false);
      } else {
        // Modo creación: limpiar formulario
        resetForm();
      }
    }
  }, [isOpen, producto]);

  const resetForm = () => {
    setDescripcion('');
    setPrecio('');
    setStock('');
    setImageURL('');
    setEsRetornable(false);
    setActivo(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      setError('El precio debe ser un número válido mayor o igual a 0');
      return;
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('El stock debe ser un número entero válido mayor o igual a 0');
      return;
    }

    try {
      setIsSubmitting(true);

      // Preparar datos para el backend
      // El backend espera: descripcion, precio, stock, esRetornable, activo, imageURL
      const productoData: any = {
        descripcion: descripcion.trim(),
        precio: precioNum,
        stock: stockNum,
        esRetornable: esRetornable,
        activo: activo,
      };

      // Agregar imagen si está disponible
      if (imageURL.trim()) {
        productoData.imageURL = imageURL.trim();
      }

      if (producto) {
        // Modo edición
        const productoId = producto.codigo || producto.id;
        await updateProducto(Number(productoId), productoData);
        alert('Producto actualizado exitosamente');
      } else {
        // Modo creación
        await createProducto(productoData);
        alert('Producto creado exitosamente');
      }

      // Recargar productos
      await loadProductos();
      
      // Cerrar modal
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error guardando producto';
      setError(errorMessage);
      console.error('Error guardando producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = !!producto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditMode ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Bidón de agua 20L"
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* URL de Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Imagen
            </label>
            <input
              type="url"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {imageURL && (
              <div className="mt-2">
                <img
                  src={imageURL}
                  alt="Vista previa"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Es Retornable */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="esRetornable"
              checked={esRetornable}
              onChange={(e) => setEsRetornable(e.target.checked)}
              className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="esRetornable" className="text-sm font-medium text-gray-700 cursor-pointer">
              Es retornable
            </label>
          </div>

          {/* Activo */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer">
              Producto activo
            </label>
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductoModal;

