import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapRouteStops } from '../hooks/useMapPedidos';
import { stopsToLineStringCoordinates, stopDisplayOrdenReparto } from '../utils/routeStops';
import type { MapRouteStop } from '../utils/routeStops';
import { usePedidosStore } from '@/features/pedidos/stores/pedidosStore';
import { fetchRoadRouteCoordinates, MAX_OR_ROUTE_SEGMENTS } from '../services/fetchRouteGeometry';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatCurrency } from '@/utils/formatters';
import { Package, Navigation, X, Maximize2 } from 'lucide-react';
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

const ESTADO_FILTER_LABELS: Record<string, string> = {
  todos: 'Todos',
  pendient: 'Pendientes',
  proceso: 'En proceso',
  entregad: 'Entregados',
  anulado: 'Anulados',
};

function pedidoLabel(p: Pedido): string {
  return (
    p.cliente_nombre ||
    `${p.cliente?.nombre || ''} ${p.cliente?.apellido || ''}`.trim() ||
    'Cliente'
  );
}

function MapView() {
  const navigate = useNavigate();
  const stops = useMapRouteStops();
  const filters = usePedidosStore((s) => s.filters);
  const loadPedidos = usePedidosStore((s) => s.loadPedidos);
  const { coordinates: userLocation } = useGeolocation();
  const mapRef = useRef<MapRef>(null);
  const [popupStop, setPopupStop] = useState<MapRouteStop | null>(null);
  const [roadCoords, setRoadCoords] = useState<[number, number][] | null>(null);
  const [roadStatus, setRoadStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const straightCoords = useMemo(() => stopsToLineStringCoordinates(stops), [stops]);
  const stopsLineKey = useMemo(() => JSON.stringify(straightCoords), [straightCoords]);

  const orsKey = import.meta.env.VITE_ORS_API_KEY;

  useEffect(() => {
    loadPedidos(false);
  }, [loadPedidos]);

  useEffect(() => {
    if (straightCoords.length < 2) {
      setRoadCoords(null);
      setRoadStatus('idle');
      return;
    }
    const segments = straightCoords.length - 1;
    if (!orsKey?.trim() || segments > MAX_OR_ROUTE_SEGMENTS) {
      setRoadCoords(null);
      setRoadStatus('idle');
      return;
    }

    const ac = new AbortController();
    setRoadStatus('loading');
    setRoadCoords(null);

    fetchRoadRouteCoordinates(straightCoords, orsKey, ac.signal)
      .then((coords) => {
        if (ac.signal.aborted) return;
        if (coords && coords.length >= 2) {
          setRoadCoords(coords);
          setRoadStatus('ready');
        } else {
          setRoadCoords(null);
          setRoadStatus('error');
        }
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setRoadCoords(null);
          setRoadStatus('error');
        }
      });

    return () => ac.abort();
  }, [stopsLineKey, orsKey, straightCoords]);

  const displayLineCoords = useMemo(() => {
    if (roadStatus === 'ready' && roadCoords && roadCoords.length >= 2) return roadCoords;
    return straightCoords;
  }, [roadStatus, roadCoords, straightCoords]);

  const lineFeature = useMemo(() => {
    if (displayLineCoords.length < 2) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: displayLineCoords,
      },
    };
  }, [displayLineCoords]);

  const fitRouteBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || stops.length === 0) return;
    const b = new maplibregl.LngLatBounds();
    stops.forEach((s) => b.extend([s.lng, s.lat]));
    if (userLocation) {
      b.extend([userLocation.longitude, userLocation.latitude]);
    }
    map.fitBounds(b, {
      padding: { top: 120, bottom: 100, left: 48, right: 48 },
      maxZoom: 15,
      duration: 700,
    });
  }, [stops, userLocation]);

  useEffect(() => {
    if (stops.length === 0) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    const run = () => fitRouteBounds();
    if (map.isStyleLoaded()) run();
    else map.once('load', run);
  }, [stopsLineKey, fitRouteBounds, stops.length]);

  useEffect(() => {
    if (stops.length > 0 || !userLocation || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 14,
      duration: 1500,
    });
  }, [userLocation, stops.length]);

  const handleMarkerClick = useCallback((stop: MapRouteStop) => {
    setPopupStop(stop);
  }, []);

  const handleClosePopup = useCallback(() => {
    setPopupStop(null);
  }, []);

  const totalPedidosEnMapa = useMemo(() => stops.reduce((n, s) => n + s.pedidos.length, 0), [stops]);

  const routeStatusLabel = useMemo(() => {
    if (straightCoords.length < 2) return null;
    const key = orsKey?.trim();
    const segments = straightCoords.length - 1;
    if (!key) return 'Ruta directa entre paradas';
    if (segments > MAX_OR_ROUTE_SEGMENTS) {
      return `Ruta directa (máx. ${MAX_OR_ROUTE_SEGMENTS} tramos para ORS)`;
    }
    if (roadStatus === 'loading') return 'Calculando ruta por calles…';
    if (roadStatus === 'ready') return 'Ruta por calles (OpenRouteService)';
    if (roadStatus === 'error') return 'Ruta directa (ORS no disponible)';
    return null;
  }, [straightCoords.length, orsKey, roadStatus, stopsLineKey]);

  return (
    <div className="relative h-[calc(100vh-8rem)] min-h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package size={20} />
            Mapa de Pedidos
          </h2>
          <p className="text-xs text-white/60 mt-1 max-w-xl">
            {filters.zona ? (
              <>
                Orden de reparto según ruta en zona <span className="text-white/90 font-medium">{filters.zona}</span>
                {filters.estado !== 'todos' && (
                  <>
                    {' '}
                    · {ESTADO_FILTER_LABELS[filters.estado] ?? filters.estado}
                  </>
                )}
              </>
            ) : (
              <>
                Orden igual que la lista filtrada
                {filters.estado !== 'todos' && (
                  <>
                    {' '}
                    · {ESTADO_FILTER_LABELS[filters.estado] ?? filters.estado}
                  </>
                )}
              </>
            )}
          </p>
          <p className="text-[11px] text-white/45 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 border border-white/80" />
              Tu ubicación
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex w-5 h-5 rounded-full bg-[#00D1FF] border border-white items-center justify-center text-[9px] font-bold text-white">
                1
              </span>
              Parada (número = orden)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-8 h-0.5 bg-cyan-400/90 rounded" />
              {roadStatus === 'ready' ? 'Ruta por calles' : 'Ruta directa entre paradas'}
            </span>
          </p>
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 justify-end">
          {routeStatusLabel && (
            <span className="text-xs px-2 py-1 rounded-lg bg-black/40 text-white/80 border border-white/10 max-w-[220px] sm:max-w-none">
              {routeStatusLabel}
            </span>
          )}
          <span className="text-sm text-white/70">
            {totalPedidosEnMapa} pedido{totalPedidosEnMapa !== 1 ? 's' : ''} · {stops.length} parada
            {stops.length !== 1 ? 's' : ''}
          </span>
          {stops.length > 0 && (
            <button
              type="button"
              onClick={fitRouteBounds}
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all backdrop-blur-sm border border-white/10"
              title="Ajustar vista a la ruta"
            >
              <Maximize2 size={18} />
            </button>
          )}
          <button
            type="button"
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
        {lineFeature && (
          <Source id="pedidos-route" type="geojson" data={lineFeature}>
            <Layer
              id="pedidos-route-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': roadStatus === 'ready' ? '#38bdf8' : '#22d3ee',
                'line-width': roadStatus === 'ready' ? 5 : 3,
                'line-opacity': 0.88,
              }}
            />
          </Source>
        )}

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

        {stops.map((stop) => (
          <Marker
            key={`${stop.sequence}-${stop.lng}-${stop.lat}`}
            longitude={stop.lng}
            latitude={stop.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(stop);
            }}
          >
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <div className="min-w-9 h-9 px-1 rounded-full bg-[#00D1FF] border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-sm tabular-nums">
                {stop.sequence}
              </div>
              {stop.pedidos.length > 1 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-0.5 rounded-full bg-amber-500 border border-white text-[10px] font-bold text-white flex items-center justify-center">
                  {stop.pedidos.length}
                </span>
              )}
            </div>
          </Marker>
        ))}

        {popupStop && (
          <Popup
            longitude={popupStop.lng}
            latitude={popupStop.lat}
            anchor="bottom"
            onClose={handleClosePopup}
            closeOnClick={false}
            className="maplibre-popup"
          >
            <div className="p-2 min-w-[220px] max-w-[280px] text-left text-gray-900">
              <p className="font-semibold text-sm">
                Parada {popupStop.sequence} de {stops.length}
              </p>
              {(() => {
                const ord = stopDisplayOrdenReparto(popupStop);
                return ord != null ? (
                  <p className="text-xs text-gray-600 mt-0.5">Orden en ruta (tabla): {ord}</p>
                ) : null;
              })()}
              <ul className="mt-2 space-y-2 border-t border-gray-200 pt-2">
                {popupStop.pedidos.map((p) => (
                  <li key={p.id} className="text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    <p className="font-medium">{pedidoLabel(p)}</p>
                    {p.direccion && <p className="text-gray-600 mt-0.5">{p.direccion}</p>}
                    <p className="text-gray-600 mt-0.5">
                      Estado:{' '}
                      <span className="font-medium text-gray-800">
                        {ESTADO_LABELS[p.estado] || p.estado}
                      </span>
                    </p>
                    {p.total != null && (
                      <p className="text-xs font-semibold mt-0.5 text-[#00a8cc]">{formatCurrency(p.total)}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        )}
      </Map>

      {stops.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-[5]">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center max-w-sm">
            <Package size={40} className="mx-auto text-white/50 mb-2" />
            <p className="text-white font-medium">Sin pedidos con ubicación</p>
            <p className="text-white/60 text-sm mt-1">
              Los pedidos con coordenadas GPS aparecerán aquí. Asegurate de que los clientes tengan
              latitud y longitud configuradas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
