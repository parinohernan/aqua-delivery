// Configuración del mapa para PWA
const MAP_CONFIG = {
  // Configuración por defecto del mapa
  defaultCenter: [-34.6037, -58.3816], // Buenos Aires
  defaultZoom: 13,
  
  // Proveedores de tiles con fallbacks
  tileProviders: [
    {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    {
      name: 'CartoDB',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB'
    },
    {
      name: 'Stamen',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
      attribution: '© Stamen Design'
    }
  ],
  
  // Configuración de marcadores
  markerConfig: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }
};

// Función para inicializar el mapa con manejo de errores
function initMapPWA(containerId, options = {}) {
  console.log('🗺️ Inicializando mapa PWA...');
  
  // Verificar si Leaflet está disponible
  if (typeof L === 'undefined') {
    console.error('❌ Leaflet no está disponible');
    showMapError(containerId, 'Leaflet no se pudo cargar. Recarga la página.');
    return null;
  }
  
  try {
    // Configuración del mapa
    const mapOptions = {
      center: options.center || MAP_CONFIG.defaultCenter,
      zoom: options.zoom || MAP_CONFIG.defaultZoom,
      zoomControl: true,
      attributionControl: true,
      ...options
    };
    
    // Crear el mapa
    const map = L.map(containerId, mapOptions);
    
    // Agregar capa de tiles con fallback
    addTileLayerWithFallback(map);
    
    // Configurar controles adicionales
    setupMapControls(map);
    
    console.log('✅ Mapa PWA inicializado correctamente');
    return map;
    
  } catch (error) {
    console.error('💥 Error inicializando mapa PWA:', error);
    showMapError(containerId, 'Error al cargar el mapa. Intenta recargar la página.');
    return null;
  }
}

// Función para agregar capa de tiles con fallback
function addTileLayerWithFallback(map) {
  let currentProviderIndex = 0;
  
  function addTileLayer() {
    if (currentProviderIndex >= MAP_CONFIG.tileProviders.length) {
      console.error('❌ Todos los proveedores de tiles fallaron');
      showMapError(map.getContainer().id, 'No se pudo cargar el mapa. Verifica tu conexión.');
      return;
    }
    
    const provider = MAP_CONFIG.tileProviders[currentProviderIndex];
    console.log(`🗺️ Intentando proveedor: ${provider.name}`);
    
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 18,
      subdomains: 'abc'
    });
    
    tileLayer.addTo(map);
    
    // Verificar si la capa se cargó correctamente
    tileLayer.on('tileloadstart', () => {
      console.log(`✅ Proveedor ${provider.name} cargado correctamente`);
    });
    
    tileLayer.on('tileerror', (error) => {
      console.warn(`⚠️ Error con proveedor ${provider.name}:`, error);
      currentProviderIndex++;
      map.removeLayer(tileLayer);
      addTileLayer(); // Intentar con el siguiente proveedor
    });
  }
  
  addTileLayer();
}

// Función para configurar controles del mapa
function setupMapControls(map) {
  // Agregar control de escala
  L.control.scale({
    imperial: false,
    metric: true,
    position: 'bottomleft'
  }).addTo(map);
  
  // Agregar control de capas (para futuras funcionalidades)
  const layerControl = L.control.layers(null, null, {
    position: 'topright'
  }).addTo(map);
  
  return layerControl;
}

// Función para mostrar error en el mapa
function showMapError(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
        <h3 style="color: #6c757d; margin-bottom: 0.5rem;">Error del Mapa</h3>
        <p style="color: #6c757d; margin-bottom: 1rem;">${message}</p>
        <button onclick="location.reload()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        ">🔄 Recargar</button>
      </div>
    `;
  }
}

// Función para agregar marcador con manejo de errores
function addMarkerPWA(map, latlng, options = {}) {
  try {
    const markerOptions = {
      ...MAP_CONFIG.markerConfig,
      ...options
    };
    
    const marker = L.marker(latlng, markerOptions);
    marker.addTo(map);
    
    return marker;
  } catch (error) {
    console.error('💥 Error agregando marcador:', error);
    return null;
  }
}

// Función para geocodificar dirección
async function geocodeAddress(address) {
  try {
    // Usar Nominatim (OpenStreetMap) para geocodificación
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    } else {
      throw new Error('No se encontró la dirección');
    }
    
  } catch (error) {
    console.error('💥 Error en geocodificación:', error);
    return null;
  }
}

// Función para calcular ruta entre dos puntos
async function calculateRoute(from, to) {
  try {
    // Usar OSRM para calcular rutas
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return {
        geometry: data.routes[0].geometry,
        distance: data.routes[0].distance,
        duration: data.routes[0].duration
      };
    } else {
      throw new Error('No se pudo calcular la ruta');
    }
    
  } catch (error) {
    console.error('💥 Error calculando ruta:', error);
    return null;
  }
}

// Función para detectar ubicación del usuario
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('💥 Error obteniendo ubicación:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

// Exportar funciones para uso global
window.MAP_CONFIG = MAP_CONFIG;
window.initMapPWA = initMapPWA;
window.addMarkerPWA = addMarkerPWA;
window.geocodeAddress = geocodeAddress;
window.calculateRoute = calculateRoute;
window.getUserLocation = getUserLocation;

console.log('🗺️ Mapa PWA configurado y listo');
