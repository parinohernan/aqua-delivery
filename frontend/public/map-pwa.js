// Configuración del mapa para PWA
const MAP_CONFIG = {
  // Configuración por defecto del mapa
  defaultCenter: [-34.6037, -58.3816], // Buenos Aires
  defaultZoom: 13,
  
  // Proveedores de tiles con fallbacks
  tileProviders: [
    // Proveedores optimizados para móviles (más ligeros)
    {
      name: 'CartoDB Light Mobile',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB',
      subdomains: 'abcd',
      mobileOptimized: true
    },
    {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      subdomains: 'abc'
    },
    {
      name: 'CartoDB Dark Mobile',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CartoDB',
      subdomains: 'abcd',
      mobileOptimized: true
    },
    // Proveedores alternativos para móviles
    {
      name: 'Thunderforest Transport',
      url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
      attribution: '© Thunderforest',
      subdomains: 'abc'
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
    // Proveedores de respaldo
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
    
    // En móvil, agregar configuración específica
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      console.log('📱 Configurando mapa optimizado para móvil...');
      // Reducir el zoom máximo en móvil para mejor rendimiento
      map.setMaxZoom(16);
    }
    
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
  
  // Verificar si estamos en móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
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
    
    // Timeout más agresivo en móviles
    const timeoutDuration = isMobile ? 5000 : 10000; // 5 segundos en móvil, 10 en desktop
    
    tileLoadTimeout = setTimeout(() => {
      if (tilesLoaded === 0) {
        console.warn(`⚠️ Timeout con proveedor ${provider.name} - no se cargaron tiles`);
        map.removeLayer(tileLayer);
        currentProviderIndex++;
        addTileLayer();
      }
    }, timeoutDuration);
    
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
    
    // Crear un fondo más informativo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    // Crear gradiente de fondo más atractivo
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#f0f8ff');
    gradient.addColorStop(0.5, '#e6f3ff');
    gradient.addColorStop(1, '#d4edda');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Agregar líneas de cuadrícula más visibles
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 1;
    
    // Cuadrícula principal
    for (let i = 0; i < 256; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
    
    // Cuadrícula secundaria
    ctx.strokeStyle = '#7bb3f0';
    ctx.lineWidth = 0.5;
    
    for (let i = 32; i < 256; i += 32) {
      if (i % 64 !== 0) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }
    }
    
    // Agregar texto informativo en el centro
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MAPA', 128, 120);
    ctx.font = '12px Arial';
    ctx.fillText('DE RESPALDO', 128, 140);
    
    // Crear URL de datos para el canvas
    const dataURL = canvas.toDataURL();
    
    // Crear tile layer personalizado
    const customTileLayer = L.tileLayer(dataURL, {
      tileSize: 256,
      attribution: 'Mapa de respaldo'
    });
    
    customTileLayer.addTo(map);
    
    // Agregar mensaje informativo más detallado
    const infoDiv = L.control({ position: 'topright' });
    infoDiv.onAdd = function() {
      const div = L.DomUtil.create('div', 'info');
      div.innerHTML = `
        <div style="
          background: rgba(255, 255, 255, 0.95);
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 12px;
          color: #333;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border-left: 4px solid #4a90e2;
          max-width: 200px;
        ">
          <div style="font-weight: bold; margin-bottom: 4px;">🗺️ Mapa de Respaldo</div>
          <div style="font-size: 11px; color: #666;">
            Los marcadores funcionan normalmente
          </div>
        </div>
      `;
      return div;
    };
    infoDiv.addTo(map);
    
    console.log('✅ Mapa de respaldo mejorado creado');
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
    // En móvil, priorizar proveedores optimizados para móviles
    optimizedProviders.sort((a, b) => {
      // Priorizar proveedores marcados como mobileOptimized
      if (a.mobileOptimized && !b.mobileOptimized) return -1;
      if (!a.mobileOptimized && b.mobileOptimized) return 1;
      
      const aPriority = getProviderPriority(a.name, isSlowConnection);
      const bPriority = getProviderPriority(b.name, isSlowConnection);
      return bPriority - aPriority;
    });
    
    console.log('📱 Proveedores optimizados para móvil:', optimizedProviders.map(p => p.name));
  }
  
  return optimizedProviders;
}

// Función para obtener prioridad del proveedor
function getProviderPriority(providerName, isSlowConnection) {
  const priorities = {
    'CartoDB Light Mobile': isSlowConnection ? 12 : 10,
    'CartoDB Dark Mobile': isSlowConnection ? 11 : 9,
    'OpenStreetMap': isSlowConnection ? 8 : 9,
    'Thunderforest Transport': isSlowConnection ? 7 : 8,
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
