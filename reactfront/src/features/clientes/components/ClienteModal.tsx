import { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
import { useClientesStore } from '../stores/clientesStore';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { Cliente, Zona } from '@/types/entities';

// Fix para los iconos de Leaflet en React (comentado temporalmente)
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
// });

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
  const [zonaId, setZonaId] = useState<number | ''>('');
  const [latitud, setLatitud] = useState<string>('');
  const [longitud, setLongitud] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.603722, -58.381592]); // Buenos Aires por defecto
  
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [mapReady, setMapReady] = useState(false);
  // const mapKeyRef = useRef(0);

  // Icono personalizado para el marcador (comentado temporalmente)
  // const markerIcon = useMemo(() => {
  //   return L.icon({
  //     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  //     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  //     iconSize: [25, 41],
  //     iconAnchor: [12, 41],
  //     popupAnchor: [1, -34],
  //     shadowSize: [41, 41]
  //   });
  // }, []);

  // Cargar zonas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadZonas();
      // setMapReady(false);
      // mapKeyRef.current += 1;
      
      if (cliente) {
        // Modo edición: cargar datos del cliente
        setNombre(cliente.nombre || '');
        setApellido(cliente.apellido || '');
        setTelefono(cliente.telefono || '');
        setDireccion(cliente.direccion || '');
        setZonaId(cliente.zonaId || cliente.zona?.id || '');
        const lat = cliente.latitud?.toString() || '';
        const lng = cliente.longitud?.toString() || '';
        setLatitud(lat);
        setLongitud(lng);
        
        // Si hay coordenadas, centrar el mapa en ellas (comentado temporalmente)
        // if (lat && lng) {
        //   const latNum = parseFloat(lat);
        //   const lngNum = parseFloat(lng);
        //   if (!isNaN(latNum) && !isNaN(lngNum)) {
        //     setMapCenter([latNum, lngNum]);
        //   }
        // }
      } else {
        // Modo creación: limpiar formulario
        resetForm();
      }
    }
    // else {
    //   setMapReady(false);
    //   mapKeyRef.current += 1;
    // }
  }, [isOpen, cliente]);

  const loadZonas = async () => {
    try {
      setIsLoading(true);
      const zonasData = await apiClient.get<Zona[]>(endpoints.zonas());
      setZonas(zonasData);
    } catch (error) {
      console.error('Error cargando zonas:', error);
      setError('Error cargando zonas');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setTelefono('');
    setDireccion('');
    setZonaId('');
    setLatitud('');
    setLongitud('');
    // setMapCenter([-34.603722, -58.381592]); // Resetear a Buenos Aires
    // setMapReady(false);
    setError(null);
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

      // Preparar datos para el backend
      // El backend espera: nombre, apellido, direccion, zona (ID de zona), telefono, saldoDinero, saldoRetornables, latitud, longitud
      const clienteData: any = {
        nombre: nombre.trim(),
        apellido: apellido.trim() || '',
        telefono: telefono.trim() || '',
        direccion: direccion.trim() || '',
        zona: zonaId ? Number(zonaId) : null,
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
        alert('Cliente actualizado exitosamente');
      } else {
        // Modo creación
        await createCliente(clienteData);
        alert('Cliente creado exitosamente');
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
          setMapCenter([parseFloat(lat), parseFloat(lng)]);
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

  // Componentes del mapa comentados temporalmente
  // function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  //   useMapEvents({
  //     click: (e) => {
  //       const { lat, lng } = e.latlng;
  //       onMapClick(lat, lng);
  //     },
  //   });
  //   return null;
  // }

  // function MapCenterUpdater({ center }: { center: [number, number] }) {
  //   const map = useMap();
  //   useEffect(() => {
  //     map.setView(center, map.getZoom());
  //   }, [center, map]);
  //   return null;
  // }

  // function ClienteMap({
  //   center,
  //   latitud,
  //   longitud,
  //   onMapClick,
  //   markerIcon,
  //   mapKey,
  // }: {
  //   center: [number, number];
  //   latitud: string;
  //   longitud: string;
  //   onMapClick: (lat: number, lng: number) => void;
  //   markerIcon: L.Icon;
  //   mapKey: number;
  // }) {
  //   const mapRef = useRef<L.Map | null>(null);
  //   const containerId = useMemo(() => `map-container-${mapKey}`, [mapKey]);
  //   
  //   useEffect(() => {
  //     return () => {
  //       if (mapRef.current) {
  //         try {
  //           mapRef.current.remove();
  //         } catch (e) {
  //           console.warn('Error removing map:', e);
  //         }
  //         mapRef.current = null;
  //       }
  //       const container = document.getElementById(containerId);
  //       if (container) {
  //         container.innerHTML = '';
  //         if ((container as any)._leaflet_id) {
  //           delete (container as any)._leaflet_id;
  //         }
  //       }
  //     };
  //   }, [containerId]);
  //   
  //   return (
  //     <div id={containerId} style={{ height: '100%', width: '100%' }}>
  //       <MapContainer
  //         center={center}
  //         zoom={latitud && longitud ? 15 : 12}
  //         style={{ height: '100%', width: '100%', zIndex: 0 }}
  //         scrollWheelZoom={true}
  //         whenCreated={(map) => {
  //           mapRef.current = map;
  //           setTimeout(() => {
  //             try {
  //               map.invalidateSize();
  //             } catch (e) {
  //               console.warn('Error invalidating map size:', e);
  //             }
  //           }, 300);
  //         }}
  //       >
  //         <TileLayer
  //           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //         />
  //         <MapCenterUpdater center={center} />
  //         <MapClickHandler onMapClick={onMapClick} />
  //         {latitud && longitud && !isNaN(parseFloat(latitud)) && !isNaN(parseFloat(longitud)) && (
  //           <Marker
  //             position={[parseFloat(latitud), parseFloat(longitud)]}
  //             icon={markerIcon}
  //           />
  //         )}
  //       </MapContainer>
  //     </div>
  //   );
  // }

  if (!isOpen) return null;

  const isEditMode = !!cliente;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditMode ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nombre del cliente"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Apellido del cliente (opcional)"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Teléfono de contacto (opcional)"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Dirección del cliente (opcional)"
            />
          </div>

          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona
            </label>
            <select
              value={zonaId}
              onChange={(e) => setZonaId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar zona (opcional)</option>
              {zonas.map((zona) => (
                <option key={zona.id} value={zona.id}>
                  {zona.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Coordenadas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación (Coordenadas)
            </label>
            
            {/* Mapa comentado temporalmente */}
            {/* <div className="mb-3 h-64 w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
              {isOpen && mapReady ? (
                <ClienteMap
                  key={`cliente-map-component-${mapKeyRef.current}`}
                  center={mapCenter}
                  latitud={latitud}
                  longitud={longitud}
                  onMapClick={(lat, lng) => {
                    setLatitud(lat.toFixed(6));
                    setLongitud(lng.toFixed(6));
                    setMapCenter([lat, lng]);
                  }}
                  markerIcon={markerIcon}
                  mapKey={mapKeyRef.current}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500">
                  <p>Cargando mapa...</p>
                </div>
              )}
            </div> */}

            {/* Campos de coordenadas */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Latitud</label>
                <input
                  type="number"
                  step="any"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: -34.603722"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Longitud</label>
                <input
                  type="number"
                  step="any"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: -58.381592"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 text-sm"
            >
              📍 Obtener mi ubicación actual
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Ingresa las coordenadas manualmente o usa el botón para obtener tu ubicación actual.
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar Cliente' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClienteModal;
