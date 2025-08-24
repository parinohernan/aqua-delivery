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
      attribution: '© OpenStreetMap contributors',
      subdomains: 'abc'
    },
    {
      name: 'CartoDB Light',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB',
      subdomains: 'abcd'
    },
    {
      name: 'CartoDB Dark',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB',
      subdomains: 'abcd'
    },
    {
      name: 'Esri World Street',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    {
      name: 'Esri World Topo',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    {
      name: 'Stamen Terrain',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
      attribution: '© Stamen Design',
      subdomains: 'abcd'
    },
    {
      name: 'Stamen Watercolor',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
      attribution: '© Stamen Design',
      subdomains: 'abcd'
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
async function initMapPWA(containerId, options = {}) {
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
    
    // Detectar mejor proveedor y agregar capa de tiles
    const optimizedProviders = await detectBestTileProvider();
    addTileLayerWithFallback(map, optimizedProviders);
    
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
function addTileLayerWithFallback(map, providers = MAP_CONFIG.tileProviders) {
  let currentProviderIndex = 0;
  let tileLoadTimeout;
  let tilesLoaded = 0;
  let tilesFailed = 0;
  
  function addTileLayer() {
    if (currentProviderIndex >= providers.length) {
      console.error('❌ Todos los proveedores de tiles fallaron');
      console.log('🔄 Intentando crear mapa de respaldo...');
      
      // Intentar crear mapa de respaldo
      const fallbackMap = createFallbackMap(map.getContainer().id, {
        center: map.getCenter(),
        zoom: map.getZoom()
      });
      
      if (fallbackMap) {
        // Reemplazar el mapa actual con el de respaldo
        map.remove();
        return fallbackMap;
      } else {
        showMapError(map.getContainer().id, 'No se pudo cargar el mapa. Verifica tu conexión.');
        return;
      }
    }
    
    const provider = providers[currentProviderIndex];
    console.log(`🗺️ Intentando proveedor: ${provider.name}`);
    
    // Configuración del tile layer
    const tileOptions = {
      attribution: provider.attribution,
      maxZoom: 18,
      minZoom: 1,
      crossOrigin: true
    };
    
    // Agregar subdomains si están definidos
    if (provider.subdomains) {
      tileOptions.subdomains = provider.subdomains;
    }
    
    const tileLayer = L.tileLayer(provider.url, tileOptions);
    
    // Contador de tiles
    tilesLoaded = 0;
    tilesFailed = 0;
    
    // Timeout para detectar si no se cargan tiles
    tileLoadTimeout = setTimeout(() => {
      if (tilesLoaded === 0) {
        console.warn(`⚠️ Timeout con proveedor ${provider.name} - no se cargaron tiles`);
        map.removeLayer(tileLayer);
        currentProviderIndex++;
        addTileLayer();
      }
    }, 10000); // 10 segundos de timeout
    
    tileLayer.addTo(map);
    
    // Eventos para detectar carga exitosa
    tileLayer.on('tileloadstart', () => {
      console.log(`🔄 Cargando tile de ${provider.name}...`);
    });
    
    tileLayer.on('tileload', () => {
      tilesLoaded++;
      console.log(`✅ Tile cargado de ${provider.name} (${tilesLoaded} tiles)`);
      
      // Si se cargaron suficientes tiles, considerar exitoso
      if (tilesLoaded >= 3) {
        clearTimeout(tileLoadTimeout);
        console.log(`✅ Proveedor ${provider.name} funcionando correctamente`);
      }
    });
    
    tileLayer.on('tileerror', (error) => {
      tilesFailed++;
      console.warn(`⚠️ Error de tile con ${provider.name}:`, error);
      
      // Si fallan demasiados tiles, cambiar de proveedor
      if (tilesFailed >= 5) {
        clearTimeout(tileLoadTimeout);
        console.warn(`⚠️ Demasiados errores con ${provider.name}, cambiando proveedor`);
        map.removeLayer(tileLayer);
        currentProviderIndex++;
        addTileLayer();
      }
    });
    
    // Evento para cuando se completa la carga inicial
    tileLayer.on('loading', () => {
      console.log(`🔄 Iniciando carga de ${provider.name}...`);
    });
    
    tileLayer.on('load', () => {
      clearTimeout(tileLoadTimeout);
      console.log(`✅ Carga completada de ${provider.name}`);
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

// Función para crear mapa de respaldo con fondo simple
function createFallbackMap(containerId, options = {}) {
  console.log('🔄 Creando mapa de respaldo...');
  
  try {
    const map = L.map(containerId, {
      center: options.center || MAP_CONFIG.defaultCenter,
      zoom: options.zoom || MAP_CONFIG.defaultZoom,
      zoomControl: true,
      attributionControl: false
    });
    
    // Crear un fondo simple con gradiente
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    // Crear gradiente de fondo
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#e3f2fd');
    gradient.addColorStop(1, '#bbdefb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Agregar líneas de cuadrícula
    ctx.strokeStyle = '#90caf9';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
    
    // Crear URL de datos para el canvas
    const dataURL = canvas.toDataURL();
    
    // Crear tile layer personalizado
    const customTileLayer = L.tileLayer(dataURL, {
      tileSize: 256,
      attribution: 'Mapa de respaldo'
    });
    
    customTileLayer.addTo(map);
    
    // Agregar mensaje informativo
    const infoDiv = L.control({ position: 'topright' });
    infoDiv.onAdd = function() {
      const div = L.DomUtil.create('div', 'info');
      div.innerHTML = `
        <div style="
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          🗺️ Mapa de respaldo
        </div>
      `;
      return div;
    };
    infoDiv.addTo(map);
    
    console.log('✅ Mapa de respaldo creado');
    return map;
    
  } catch (error) {
    console.error('💥 Error creando mapa de respaldo:', error);
    showMapError(containerId, 'No se pudo crear el mapa. Intenta recargar la página.');
    return null;
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

// Función para detectar el mejor proveedor de tiles
async function detectBestTileProvider() {
  console.log('🔍 Detectando mejor proveedor de tiles...');
  
  // Verificar si estamos en móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Verificar tipo de conexión
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  
  console.log(`📱 Dispositivo: ${isMobile ? 'Móvil' : 'Desktop'}`);
  console.log(`🌐 Conexión: ${connection ? connection.effectiveType : 'Desconocida'}`);
  
  // Reordenar proveedores según el dispositivo y conexión
  let optimizedProviders = [...MAP_CONFIG.tileProviders];
  
  if (isMobile) {
    // En móvil, priorizar proveedores más ligeros
    optimizedProviders.sort((a, b) => {
      const aPriority = getProviderPriority(a.name, isSlowConnection);
      const bPriority = getProviderPriority(b.name, isSlowConnection);
      return bPriority - aPriority;
    });
  }
  
  return optimizedProviders;
}

// Función para obtener prioridad del proveedor
function getProviderPriority(providerName, isSlowConnection) {
  const priorities = {
    'CartoDB Light': isSlowConnection ? 10 : 8,
    'CartoDB Dark': isSlowConnection ? 9 : 7,
    'OpenStreetMap': isSlowConnection ? 8 : 9,
    'Esri World Street': isSlowConnection ? 7 : 6,
    'Esri World Topo': isSlowConnection ? 6 : 5,
    'Stamen Terrain': isSlowConnection ? 5 : 4,
    'Stamen Watercolor': isSlowConnection ? 4 : 3
  };
  
  return priorities[providerName] || 1;
}

// Exportar funciones para uso global
window.MAP_CONFIG = MAP_CONFIG;
window.initMapPWA = initMapPWA;
window.addMarkerPWA = addMarkerPWA;
window.geocodeAddress = geocodeAddress;
window.calculateRoute = calculateRoute;
window.getUserLocation = getUserLocation;
window.detectBestTileProvider = detectBestTileProvider;
window.createFallbackMap = createFallbackMap;

console.log('🗺️ Mapa PWA configurado y listo');
