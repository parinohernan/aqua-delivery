/**
 * GeoUtils - Utilidades para cálculos geográficos
 * Responsabilidad: Cálculos de distancia y utilidades de geolocalización
 */

/**
 * Calcula la distancia entre dos puntos GPS usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en metros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

/**
 * Formatea una distancia en metros a un string legible
 * @param {number} meters - Distancia en metros
 * @returns {string} Distancia formateada ("500m" o "1.2km")
 */
function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    } else {
        return `${(meters / 1000).toFixed(1)}km`;
    }
}

/**
 * Verifica si un punto está dentro de un radio específico de otro punto
 * @param {Object} pos1 - Posición 1 {lat, lng}
 * @param {Object} pos2 - Posición 2 {lat, lng}
 * @param {number} radius - Radio en metros
 * @returns {boolean} True si está dentro del radio
 */
function isWithinRadius(pos1, pos2, radius) {
    const distance = calculateDistance(pos1.lat, pos1.lng, pos2.lat, pos2.lng);
    return distance <= radius;
}

/**
 * Calcula el bearing (dirección) entre dos puntos
 * @param {Object} pos1 - Posición inicial {lat, lng}
 * @param {Object} pos2 - Posición final {lat, lng}
 * @returns {number} Bearing en grados (0-360)
 */
function getBearing(pos1, pos2) {
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360; // Normalizar a 0-360
}

/**
 * Convierte bearing a dirección cardinal
 * @param {number} bearing - Bearing en grados
 * @returns {string} Dirección cardinal (N, NE, E, SE, S, SW, W, NW)
 */
function bearingToCardinal(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

/**
 * Obtiene la posición actual del usuario
 * @param {Object} options - Opciones de geolocalización
 * @returns {Promise<Object>} Posición {lat, lng, accuracy, timestamp}
 */
function getCurrentPosition(options = {}) {
    const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
    };

    const finalOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new Error('Geolocalización no soportada'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                reject(error);
            },
            finalOptions
        );
    });
}

/**
 * Calcula el punto medio entre dos posiciones
 * @param {Object} pos1 - Posición 1 {lat, lng}
 * @param {Object} pos2 - Posición 2 {lat, lng}
 * @returns {Object} Punto medio {lat, lng}
 */
function getMidpoint(pos1, pos2) {
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const λ1 = pos1.lng * Math.PI / 180;
    const λ2 = pos2.lng * Math.PI / 180;

    const Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
    const By = Math.cos(φ2) * Math.sin(λ2 - λ1);

    const φ3 = Math.atan2(
        Math.sin(φ1) + Math.sin(φ2),
        Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By)
    );
    const λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

    return {
        lat: φ3 * 180 / Math.PI,
        lng: λ3 * 180 / Math.PI
    };
}

// Exponer funciones globalmente
window.GeoUtils = {
    calculateDistance,
    formatDistance,
    isWithinRadius,
    getBearing,
    bearingToCardinal,
    getCurrentPosition,
    getMidpoint
};

console.log('✅ GeoUtils module loaded');
