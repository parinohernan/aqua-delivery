/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_MAPTILER_KEY?: string;
  readonly VITE_MAP_STYLE_URL?: string;
  /** OpenRouteService — ruta por calles en el mapa de pedidos (opcional) */
  readonly VITE_ORS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

