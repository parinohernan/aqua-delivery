import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { useClientesStore } from '../stores/clientesStore';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { MapPicker } from '@/features/mapa';
import { toast } from '@/utils/feedback';
import type { Cliente, Zona } from '@/types/entities';

/** Zona desde API: tiene id y zona (nombre) */
type ZonaApi = { id: number; zona: string; [k: string]: unknown };

/**
 * Modal para crear o editar un cliente
 */
interface ClienteModalProps {
  isOpen: boolean;
  cliente: Cliente | null; // null para crear, Cliente para editar
  onClose: () => void;
}

function ClienteModal({ isOpen, cliente, onClose }: ClienteModalProps) {
  const { createCliente, updateCliente, loadClientes } = useClientesStore();
  
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [zona, setZona] = useState('');
  const [latitud, setLatitud] = useState<string>('');
  const [longitud, setLongitud] = useState<string>('');
  
  const [zonas, setZonas] = useState<ZonaApi[]>([]);
  const [showNuevaZonaInput, setShowNuevaZonaInput] = useState(false);
  const [nuevaZona, setNuevaZona] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar zonas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadZonas();
      
      if (cliente) {
        // Modo edición: cargar datos del cliente (backend devuelve zona como string)
        setNombre(cliente.nombre || '');
        setApellido(cliente.apellido || '');
        setTelefono(cliente.telefono || '');
        setDireccion(cliente.direccion || '');
        const zonaVal = (cliente as { zona?: string | { nombre?: string; zona?: string } }).zona;
        setZona(typeof zonaVal === 'string' ? zonaVal : (zonaVal && typeof zonaVal === 'object' ? (zonaVal.nombre ?? zonaVal.zona ?? '') : '') || '');
        const lat = cliente.latitud?.toString() || '';
        const lng = cliente.longitud?.toString() || '';
        setLatitud(lat);
        setLongitud(lng);
      } else {
        // Modo creación: limpiar formulario
        resetForm();
      }
    }
  }, [isOpen, cliente]);

  const loadZonas = async () => {
    try {
      const zonasData = await apiClient.get<ZonaApi[]>(endpoints.zonas());
      setZonas(zonasData);
    } catch (err) {
      console.error('Error cargando zonas:', err);
      setZonas([]);
    }
  };

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setTelefono('');
    setDireccion('');
    setZona('');
    setNuevaZona('');
    setShowNuevaZonaInput(false);
    setLatitud('');
    setLongitud('');
    setError(null);
  };

  const handleCrearZona = async () => {
    if (!nuevaZona.trim()) return;
    try {
      await apiClient.post(endpoints.zonas(), { zona: nuevaZona.trim() });
      await loadZonas();
      setZona(nuevaZona.trim());
      setNuevaZona('');
      setShowNuevaZonaInput(false);
      toast.success(`Zona "${nuevaZona.trim()}" creada`);
    } catch (err) {
      toast.error('Error creando zona');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setIsSubmitting(true);

      // Preparar datos para el backend (zona es el nombre de la zona, string)
      const clienteData: Record<string, unknown> = {
        nombre: nombre.trim(),
        apellido: apellido.trim() || '',
        telefono: telefono.trim() || '',
        direccion: direccion.trim() || '',
        zona: zona.trim() || null,
      };

      // Si es edición, mantener saldo y retornables actuales (no se editan desde aquí)
      if (cliente) {
        clienteData.saldoDinero = typeof cliente.saldo === 'number' ? cliente.saldo : parseFloat(String(cliente.saldo || 0));
        clienteData.saldoRetornables = typeof cliente.retornables === 'number' ? cliente.retornables : parseFloat(String(cliente.retornables || 0));
      } else {
        // Si es creación, inicializar en 0
        clienteData.saldoDinero = 0;
        clienteData.saldoRetornables = 0;
      }

      // Agregar coordenadas si están disponibles
      if (latitud && longitud) {
        const lat = parseFloat(latitud);
        const long = parseFloat(longitud);
        if (!isNaN(lat) && !isNaN(long)) {
          clienteData.latitud = lat;
          clienteData.longitud = long;
        }
      }

      if (cliente) {
        // Modo edición
        // El backend espera el código del cliente, no el ID
        const clienteId = cliente.codigo || cliente.id;
        await updateCliente(Number(clienteId), clienteData);
        toast.success('Cliente actualizado exitosamente');
      } else {
        // Modo creación
        await createCliente(clienteData);
        toast.success('Cliente creado exitosamente');
      }

      // Recargar clientes
      await loadClientes();
      
      // Cerrar modal
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error guardando cliente';
      setError(errorMessage);
      console.error('Error guardando cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setLatitud(lat);
          setLongitud(lng);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setError('No se pudo obtener la ubicación');
          setIsLoading(false);
        }
      );
    } else {
      setError('La geolocalización no está disponible en este navegador');
    }
  };


  if (!isOpen) return null;

  const isEditMode = !!cliente;

  // Renderizar el modal usando Portal directamente en el body
  // Esto asegura que esté por encima de todo el contenido
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ isolation: 'isolate' }}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={handleClose}
        style={{ zIndex: 1 }}
      />

      {/* Modal */}
      <div 
        className="relative bg-[#0a2e1a] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-green-500/30 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 2 }}
      >
        <div className="sticky top-0 bg-[#0a2e1a] backdrop-blur-xl border-b-2 border-green-500/30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isEditMode ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
          </h3>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white text-2xl sm:text-3xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm"
              placeholder="Nombre del cliente"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm"
              placeholder="Apellido del cliente (opcional)"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm"
              placeholder="Teléfono de contacto (opcional)"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Dirección
            </label>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm resize-none"
              placeholder="Dirección del cliente (opcional)"
            />
          </div>

          {/* Zona (mismo criterio que en Pedidos: nombre de zona, listado + agregar nueva) */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Zona
            </label>
            <select
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white backdrop-blur-sm"
            >
              <option value="" className="bg-[#0f1b2e]">Sin zona</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.zona} className="bg-[#0f1b2e]">
                  {z.zona}
                </option>
              ))}
              {zona && !zonas.some((z) => z.zona === zona) && (
                <option value={zona} className="bg-[#0f1b2e]">{zona} (actual)</option>
              )}
            </select>
            <button
              type="button"
              onClick={() => setShowNuevaZonaInput((s) => !s)}
              className="mt-2 flex items-center gap-1.5 text-sm text-primary-300 hover:text-primary-200"
            >
              <Plus size={14} />
              Agregar zona
            </button>
            {showNuevaZonaInput && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={nuevaZona}
                  onChange={(e) => setNuevaZona(e.target.value)}
                  placeholder="Nombre de la zona"
                  className="flex-1 min-w-[140px] px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleCrearZona(); }
                    if (e.key === 'Escape') setShowNuevaZonaInput(false);
                  }}
                />
                <button
                  type="button"
                  onClick={handleCrearZona}
                  disabled={!nuevaZona.trim()}
                  className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  Crear zona
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNuevaZonaInput(false); setNuevaZona(''); }}
                  className="px-3 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Coordenadas */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Ubicación (Coordenadas)
            </label>
            
            {/* Campos de coordenadas */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Latitud</label>
                <input
                  type="number"
                  step="any"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm text-sm"
                  placeholder="Ej: -34.603722"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">Longitud</label>
                <input
                  type="number"
                  step="any"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-white/50 backdrop-blur-sm text-sm"
                  placeholder="Ej: -58.381592"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-primary-500/20 border border-primary-500/50 text-primary-300 rounded-lg hover:bg-primary-500/30 transition-colors disabled:opacity-50 text-sm backdrop-blur-sm"
              >
                📍 Obtener mi ubicación actual
              </button>
            </div>

            <div className="mb-2">
              <MapPicker
                lat={latitud && !isNaN(parseFloat(latitud)) ? parseFloat(latitud) : null}
                lng={longitud && !isNaN(parseFloat(longitud)) ? parseFloat(longitud) : null}
                onSelect={(lat, lng) => {
                  setLatitud(lat.toFixed(6));
                  setLongitud(lng.toFixed(6));
                }}
                height={200}
              />
            </div>

            <p className="text-xs text-white/60">
              Ingresá las coordenadas manualmente, usá el botón para tu ubicación actual o hacé click en el mapa.
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
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/20 backdrop-blur-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg hover:from-primary-500 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
            >
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar Cliente' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderizar usando Portal en el body para asegurar que esté por encima de todo
  return createPortal(modalContent, document.body);
}

export default ClienteModal;
