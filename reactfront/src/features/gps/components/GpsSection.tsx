import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapGL, { Layer, Marker, Popup, Source } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { eventosGpsService, type EventosGpsQuery } from '../services/eventosGpsService';
import { vendedoresService } from '../services/vendedoresService';
import type { EventoGps, VendedorLista } from '@/types/entities';
import {
  formatDateTimeInAppTimeZone,
} from '@/utils/formatters';
import {
  endOfAppDayUtc,
  getAppTimeZone,
  startOfAppDayUtc,
  todayDateInputValueInAppTz,
} from '@/utils/appTimeZone';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : import.meta.env.VITE_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json';

const DEFAULT_CENTER = { longitude: -58.3816, latitude: -34.6037, zoom: 12 };

const LINE_COLORS = ['#22d3ee', '#f472b6', '#a3e635', '#fb923c', '#818cf8', '#fbbf24', '#2dd4bf'];

function numCoord(v: number | string): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function vendedorLabel(e: EventoGps): string {
  const n = [e.vendedorNombre, e.vendedorApellido].filter(Boolean).join(' ').trim();
  return n || `Vendedor #${e.codigoVendedor}`;
}

function GpsSection() {
  const mapRef = useRef<MapRef>(null);
  const today = useMemo(() => new Date(), []);
  const [desdeStr, setDesdeStr] = useState(() => todayDateInputValueInAppTz(today));
  const [hastaStr, setHastaStr] = useState(() => todayDateInputValueInAppTz(today));
  const [vendedorId, setVendedorId] = useState<string>('all');
  const [vendedores, setVendedores] = useState<VendedorLista[]>([]);
  const [eventos, setEventos] = useState<EventoGps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popupEvent, setPopupEvent] = useState<EventoGps | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await vendedoresService.list();
        if (!cancelled) setVendedores(list);
      } catch {
        if (!cancelled) setVendedores([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const desde = startOfAppDayUtc(desdeStr);
      const hasta = endOfAppDayUtc(hastaStr);
      if (desde > hasta) {
        setError('La fecha "desde" no puede ser posterior a "hasta".');
        setEventos([]);
        return;
      }
      const cv = vendedorId === 'all' ? NaN : parseInt(vendedorId, 10);
      const q: EventosGpsQuery =
        vendedorId === 'all' || Number.isNaN(cv)
          ? { desde, hasta, codigoVendedor: 'all' }
          : { desde, hasta, codigoVendedor: cv };
      const rows = await eventosGpsService.list(q);
      setEventos(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar eventos');
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [desdeStr, hastaStr, vendedorId]);

  useEffect(() => {
    void loadEventos();
  }, [loadEventos]);

  const vendorIdsSorted = useMemo(() => {
    const s = new Set<number>();
    eventos.forEach((e) => s.add(e.codigoVendedor));
    return Array.from(s).sort((a, b) => a - b);
  }, [eventos]);

  const colorByVendor = useMemo(() => {
    const m = new globalThis.Map<number, string>();
    vendorIdsSorted.forEach((id, i) => m.set(id, LINE_COLORS[i % LINE_COLORS.length]));
    return m;
  }, [vendorIdsSorted]);

  const lineFeaturesByVendor = useMemo(() => {
    type LineFeat = {
      type: 'Feature';
      properties: Record<string, never>;
      geometry: { type: 'LineString'; coordinates: [number, number][] };
    };
    const lineMap = new globalThis.Map<number, LineFeat>();
    const byV = new globalThis.Map<number, EventoGps[]>();
    eventos.forEach((e) => {
      const list = byV.get(e.codigoVendedor) ?? [];
      list.push(e);
      byV.set(e.codigoVendedor, list);
    });
    byV.forEach((list: EventoGps[], vid: number) => {
      const sorted = [...list].sort(
        (a, b) => new Date(a.ocurridoEn).getTime() - new Date(b.ocurridoEn).getTime()
      );
      if (sorted.length < 2) return;
      const coordinates = sorted.map((e) => [numCoord(e.longitud), numCoord(e.latitud)] as [number, number]);
      lineMap.set(vid, {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates },
      });
    });
    return lineMap;
  }, [eventos]);

  /** Orden cronológico por vendedor: 1 = primera parada del día (para ese repartidor). */
  const stopIndexByEventId = useMemo(() => {
    const m = new globalThis.Map<number, { n: number; total: number }>();
    const byV = new globalThis.Map<number, EventoGps[]>();
    eventos.forEach((e) => {
      const list = byV.get(e.codigoVendedor) ?? [];
      list.push(e);
      byV.set(e.codigoVendedor, list);
    });
    byV.forEach((list, _vid) => {
      const sorted = [...list].sort(
        (a, b) => new Date(a.ocurridoEn).getTime() - new Date(b.ocurridoEn).getTime()
      );
      const total = sorted.length;
      sorted.forEach((e, i) => m.set(e.id, { n: i + 1, total }));
    });
    return m;
  }, [eventos]);

  const fitBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || eventos.length === 0) return;
    const b = new maplibregl.LngLatBounds();
    eventos.forEach((e) => b.extend([numCoord(e.longitud), numCoord(e.latitud)]));
    map.fitBounds(b, { padding: 80, maxZoom: 16, duration: 600 });
  }, [eventos]);

  useEffect(() => {
    if (eventos.length === 0) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    const run = () => fitBounds();
    if (map.isStyleLoaded()) run();
    else map.once('load', run);
  }, [eventos, fitBounds]);

  const focusEventoOnMap = useCallback((e: EventoGps) => {
    setPopupEvent(e);
    const map = mapRef.current?.getMap();
    if (!map) return;
    const lng = numCoord(e.longitud);
    const lat = numCoord(e.latitud);
    map.flyTo({
      center: [lng, lat],
      zoom: Math.max(map.getZoom(), 15),
      duration: 450,
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <MapPin size={22} className="text-primary-400" />
            Actividad GPS
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Itinerario de eventos por vendedor (entregas y otros registros con ubicación).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadEventos()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm text-white disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
        <label className="flex flex-col gap-1 text-xs text-white/70">
          Desde
          <input
            type="date"
            value={desdeStr}
            onChange={(e) => setDesdeStr(e.target.value)}
            className="rounded-lg bg-[#0f1b2e] border border-white/15 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/70">
          Hasta
          <input
            type="date"
            value={hastaStr}
            onChange={(e) => setHastaStr(e.target.value)}
            className="rounded-lg bg-[#0f1b2e] border border-white/15 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/70 min-w-[200px]">
          Vendedor
          <select
            value={vendedorId}
            onChange={(e) => setVendedorId(e.target.value)}
            className="rounded-lg bg-[#0f1b2e] border border-white/15 px-3 py-2 text-sm text-white"
          >
            <option value="all">Todos</option>
            {vendedores.map((v) => (
              <option key={v.codigo} value={String(v.codigo)}>
                {[v.nombre, v.apellido].filter(Boolean).join(' ') || `#${v.codigo}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="relative h-[calc(100vh-14rem)] min-h-[420px] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <div className="absolute top-0 left-0 right-0 z-10 p-3 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/45 to-transparent pointer-events-none">
          <p className="pointer-events-auto text-xs text-white/70">
            {loading ? 'Cargando…' : `${eventos.length} evento${eventos.length !== 1 ? 's' : ''}`}
          </p>
          {eventos.length > 0 && (
            <button
              type="button"
              onClick={fitBounds}
              className="pointer-events-auto p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/10"
              title="Encuadrar mapa"
            >
              <Navigation size={18} />
            </button>
          )}
        </div>

        <MapGL
          ref={mapRef}
          mapStyle={MAP_STYLE}
          initialViewState={DEFAULT_CENTER}
          style={{ width: '100%', height: '100%' }}
        >
          {vendorIdsSorted.map((vid) => {
            const feat = lineFeaturesByVendor.get(vid);
            if (!feat) return null;
            const color = colorByVendor.get(vid) ?? LINE_COLORS[0];
            return (
              <Source key={`line-${vid}`} id={`gps-line-${vid}`} type="geojson" data={feat}>
                {/* Halo: ayuda a ver la ruta sobre el mapa base */}
                <Layer
                  id={`gps-line-halo-${vid}`}
                  type="line"
                  layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                  paint={{
                    'line-color': '#0f172a',
                    'line-width': 10,
                    'line-opacity': 0.45,
                    'line-blur': 1,
                  }}
                />
                {/*
                  line-dasharray + line-cap round en MapLibre suele no pintar la línea.
                  Con line-cap butt el trazo punteado es fiable.
                */}
                <Layer
                  id={`gps-line-layer-${vid}`}
                  type="line"
                  layout={{ 'line-join': 'round', 'line-cap': 'butt' }}
                  paint={{
                    'line-color': color,
                    'line-width': 4,
                    'line-opacity': 0.95,
                    'line-dasharray': [2, 2],
                  }}
                />
              </Source>
            );
          })}

          {eventos.map((e) => {
            const lng = numCoord(e.longitud);
            const lat = numCoord(e.latitud);
            const color = colorByVendor.get(e.codigoVendedor) ?? '#22d3ee';
            const stop = stopIndexByEventId.get(e.id);
            const label = stop ? String(stop.n) : '·';
            return (
              <Marker
                key={e.id}
                longitude={lng}
                latitude={lat}
                anchor="center"
                onClick={(ev) => {
                  ev.originalEvent.stopPropagation();
                  setPopupEvent(e);
                }}
              >
                <div
                  className="flex h-7 min-w-7 px-1 items-center justify-center rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={stop ? `Parada ${stop.n} de ${stop.total} (orden del día)` : undefined}
                >
                  <span className="text-[11px] font-bold tabular-nums text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] leading-none">
                    {label}
                  </span>
                </div>
              </Marker>
            );
          })}

          {popupEvent && (
            <Popup
              longitude={numCoord(popupEvent.longitud)}
              latitude={numCoord(popupEvent.latitud)}
              anchor="top"
              onClose={() => setPopupEvent(null)}
              closeOnClick={false}
            >
              {(() => {
                const st = stopIndexByEventId.get(popupEvent.id);
                return (
                  <div className="p-2 min-w-[200px] max-w-[280px] text-left text-gray-900 text-sm">
                    <p className="font-semibold">{popupEvent.evento}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{vendedorLabel(popupEvent)}</p>
                    <p className="text-xs text-gray-600">{formatDateTimeInAppTimeZone(popupEvent.ocurridoEn)}</p>
                    {st != null && (
                      <p className="text-xs mt-1 text-gray-700">
                        Orden del día: <span className="font-semibold">{st.n}</span> de {st.total}
                      </p>
                    )}
                    {popupEvent.numeroPedido != null && String(popupEvent.numeroPedido).length > 0 && (
                      <p className="text-xs mt-1">
                        Pedido: <span className="font-medium">{popupEvent.numeroPedido}</span>
                      </p>
                    )}
                  </div>
                );
              })()}
            </Popup>
          )}
        </MapGL>

        {!loading && eventos.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none z-[5]">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center max-w-sm border border-white/10">
              <MapPin size={36} className="mx-auto text-white/50 mb-2" />
              <p className="text-white font-medium">Sin eventos en este período</p>
              <p className="text-white/60 text-sm mt-1">
                Las entregas con ubicación y otros eventos GPS aparecerán aquí.
              </p>
            </div>
          </div>
        )}
      </div>

      {eventos.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/45">
              Lista cronológica
            </span>
            <span className="text-[11px] text-white/40 tabular-nums">{eventos.length}</span>
          </div>
          <ul
            className="max-h-[min(42vh,380px)] overflow-y-auto overscroll-contain"
            aria-label="Eventos GPS en orden de tiempo"
          >
            {eventos.map((e) => {
              const color = colorByVendor.get(e.codigoVendedor) ?? LINE_COLORS[0];
              const stop = stopIndexByEventId.get(e.id);
              const active = popupEvent?.id === e.id;
              const timeShort = (() => {
                const d = new Date(e.ocurridoEn);
                if (Number.isNaN(d.getTime())) return '—';
                return new Intl.DateTimeFormat('es-AR', {
                  timeZone: getAppTimeZone(),
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(d);
              })();
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => focusEventoOnMap(e)}
                    className={[
                      'w-full text-left px-3 py-2.5 flex gap-3 items-start border-b border-white/[0.06] last:border-b-0 transition-colors',
                      active ? 'bg-white/12' : 'hover:bg-white/[0.06]',
                    ].join(' ')}
                  >
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full ring-1 ring-white/30"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0 text-[13px] leading-snug text-white/90">
                        <span className="font-mono tabular-nums text-white/55 shrink-0">{timeShort}</span>
                        <span className="font-medium text-white/95">{e.evento}</span>
                        <span className="text-white/50">·</span>
                        <span className="text-white/70 truncate">{vendedorLabel(e)}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0 text-[11px] text-white/45">
                        {stop != null && (
                          <span>
                            Parada {stop.n}/{stop.total}
                          </span>
                        )}
                        {e.numeroPedido != null && String(e.numeroPedido).trim() !== '' && (
                          <span className="tabular-nums">Pedido {e.numeroPedido}</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {vendorIdsSorted.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-white/70">
          {vendorIdsSorted.map((vid) => {
            const sample = eventos.find((e) => e.codigoVendedor === vid);
            const label = sample ? vendedorLabel(sample) : `Vendedor #${vid}`;
            return (
              <span key={vid} className="inline-flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full border border-white/40"
                  style={{ backgroundColor: colorByVendor.get(vid) }}
                />
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GpsSection;
