import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapPedidos } from '../hooks/useMapPedidos';
import { usePedidosStore } from '@/features/pedidos/stores/pedidosStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatCurrency } from '@/utils/formatters';
import { Package, Navigation, X } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import type { Pedido } from '@/types/entities';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : import.meta.env.VITE_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json';

const DEFAULT_CENTER = { longitude: -58.3816, latitude: -34.6037, zoom: 14 };

const ESTADO_LABELS: Record<string, string> = {
  pendient: 'Pendiente',
  proceso: 'En Proceso',
  entregad: 'Entregado',
  anulado: 'Anulado',
};

function parseCoord(value: number | string | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

function MapView() {
  const navigate = useNavigate();
  const pedidosConCoords = useMapPedidos();
  const loadPedidos = usePedidosStore((s) => s.loadPedidos);
  const { coordinates: userLocation } = useGeolocation();
  const mapRef = useRef<MapRef>(null);
  const [popupPedido, setPopupPedido] = useState<Pedido | null>(null);

  useEffect(() => {
    loadPedidos(false);
  }, [loadPedidos]);

  // Centrar en la ubicación del usuario cuando esté disponible
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        duration: 1500,
      });
    }
  }, [userLocation]);

  const handleMarkerClick = useCallback((pedido: Pedido) => {
    setPopupPedido(pedido);
  }, []);

  const handleClosePopup = useCallback(() => {
    setPopupPedido(null);
  }, []);

  return (
    <div className="relative h-[calc(100vh-8rem)] min-h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Package size={20} />
          Mapa de Pedidos
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70">
            {pedidosConCoords.length} pedido
            {pedidosConCoords.length !== 1 ? 's' : ''} con ubicación
          </span>
          <button
            onClick={() => navigate(ROUTES.PEDIDOS)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
            title="Cerrar mapa"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE}
        initialViewState={
          userLocation
            ? { longitude: userLocation.longitude, latitude: userLocation.latitude, zoom: 14 }
            : DEFAULT_CENTER
        }
        style={{ width: '100%', height: '100%' }}
      >
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            anchor="center"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/90 border-2 border-white shadow-lg flex items-center justify-center">
              <Navigation size={20} className="text-white" />
            </div>
          </Marker>
        )}
        {pedidosConCoords.map((pedido) => {
          const lat = parseCoord(pedido.latitud);
          const lng = parseCoord(pedido.longitud);
          if (lat == null || lng == null) return null;

          return (
            <Marker
              key={pedido.id}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(pedido);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-[#00D1FF] border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Package size={14} className="text-white" />
              </div>
            </Marker>
          );
        })}

        {popupPedido && (
          <Popup
            longitude={parseCoord(popupPedido.longitud)!}
            latitude={parseCoord(popupPedido.latitud)!}
            anchor="bottom"
            onClose={handleClosePopup}
            closeOnClick={false}
            className="maplibre-popup"
          >
            <div className="p-2 min-w-[200px] text-left text-gray-900">
              <p className="font-semibold text-sm">
                {popupPedido.cliente_nombre ||
                  `${popupPedido.cliente?.nombre || ''} ${popupPedido.cliente?.apellido || ''}`.trim() ||
                  'Cliente'}
              </p>
              {popupPedido.direccion && (
                <p className="text-xs text-gray-600 mt-1">{popupPedido.direccion}</p>
              )}
              <p className="text-xs mt-1">
                Estado:{' '}
                <span className="font-medium">
                  {ESTADO_LABELS[popupPedido.estado] || popupPedido.estado}
                </span>
              </p>
              {popupPedido.total != null && (
                <p className="text-xs font-semibold mt-1 text-[#00D1FF]">
                  {formatCurrency(popupPedido.total)}
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {pedidosConCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center max-w-sm">
            <Package size={40} className="mx-auto text-white/50 mb-2" />
            <p className="text-white font-medium">Sin pedidos con ubicación</p>
            <p className="text-white/60 text-sm mt-1">
              Los pedidos con coordenadas GPS aparecerán aquí. Asegurate de que los
              clientes tengan latitud y longitud configuradas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
