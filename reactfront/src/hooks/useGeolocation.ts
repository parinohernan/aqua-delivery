import { useState, useEffect } from 'react';

/**
 * Coordenadas geográficas
 */
interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Hook para obtener la ubicación geográfica del usuario
 */
export function useGeolocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocalización no soportada') as GeolocationPositionError);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );
  }, []);

  return { coordinates, error, isLoading };
}

