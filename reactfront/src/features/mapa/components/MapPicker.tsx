import { useCallback, useEffect, useRef, useState } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGeolocation } from '@/hooks/useGeolocation';

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
 * Centra en: 1) coordenadas del cliente, 2) ubicación del usuario, 3) Buenos Aires
 */
function MapPicker({ lat, lng, onSelect, height = 200 }: MapPickerProps) {
  const { coordinates: userLocation } = useGeolocation();
  const mapRef = useRef<MapRef>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hasCentered, setHasCentered] = useState(false);
  const clienteHasCoords = lat != null && lng != null;

  // Centrar en la ubicación correcta cuando el mapa esté listo
  useEffect(() => {
    if (mapReady && mapRef.current && !hasCentered) {
      if (clienteHasCoords) {
        mapRef.current.flyTo({
          center: [lng!, lat!],
          zoom: 15,
          duration: 800,
        });
        setHasCentered(true);
      } else if (userLocation) {
        mapRef.current.flyTo({
          center: [userLocation.longitude, userLocation.latitude],
          zoom: 15,
          duration: 800,
        });
        setHasCentered(true);
      }
    }
  }, [lat, lng, userLocation, clienteHasCoords, mapReady, hasCentered]);

  const handleMapLoad = useCallback(() => {
    setMapReady(true);
  }, []);

  const handleClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      const { lat: newLat, lng: newLng } = e.lngLat;
      onSelect(newLat, newLng);
    },
    [onSelect]
  );

  const initialViewState = lat != null && lng != null
    ? { longitude: lng, latitude: lat, zoom: 15 }
    : userLocation
      ? { longitude: userLocation.longitude, latitude: userLocation.latitude, zoom: 15 }
      : DEFAULT_CENTER;

  return (
    <div
      className="rounded-lg overflow-hidden border border-white/20"
      style={{ height }}
    >
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE}
        initialViewState={initialViewState}
        onClick={handleClick}
        onLoad={handleMapLoad}
        style={{ width: '100%', height: '100%' }}
        cursor="crosshair"
      >
        {/* Marcador de la ubicación del cliente */}
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
        {/* Marcador de tu ubicación actual (referencia) */}
        {userLocation && (
          <Marker 
            longitude={userLocation.longitude} 
            latitude={userLocation.latitude} 
            anchor="center"
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#3B82F6',
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
