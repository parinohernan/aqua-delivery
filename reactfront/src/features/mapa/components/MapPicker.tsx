import { useCallback } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : import.meta.env.VITE_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json';

const DEFAULT_CENTER = { longitude: -58.3816, latitude: -34.6037, zoom: 12 };

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onSelect: (lat: number, lng: number) => void;
  height?: number;
}

/**
 * Mapa para seleccionar ubicación haciendo click.
 * Usado en ClienteModal para asignar coordenadas al cliente.
 */
function MapPicker({ lat, lng, onSelect, height = 200 }: MapPickerProps) {
  const handleClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      const { lat: newLat, lng: newLng } = e.lngLat;
      onSelect(newLat, newLng);
    },
    [onSelect]
  );

  const initialViewState = lat != null && lng != null
    ? { longitude: lng, latitude: lat, zoom: 15 }
    : DEFAULT_CENTER;

  return (
    <div
      className="rounded-lg overflow-hidden border border-white/20"
      style={{ height }}
    >
      <style>{`.map-picker-map .maplibregl-canvas-container { cursor: crosshair; }`}</style>
      <Map
        mapStyle={MAP_STYLE}
        initialViewState={initialViewState}
        onClick={handleClick}
        style={{ width: '100%', height: '100%' }}
        className="map-picker-map"
      >
        {lat != null && lng != null && (
          <Marker longitude={lng} latitude={lat} anchor="center">
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#00D1FF',
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          </Marker>
        )}
      </Map>
      <p className="text-xs text-white/60 mt-1 px-1">
        Hacé click en el mapa para marcar la ubicación del cliente
      </p>
    </div>
  );
}

export default MapPicker;
