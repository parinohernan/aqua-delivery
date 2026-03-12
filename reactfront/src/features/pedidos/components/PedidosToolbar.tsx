import { usePedidosStore } from '../stores/pedidosStore';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Map, Search, Calendar, X, MapPin } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import NewPedidoModal from './NewPedidoModal';

type EstadoKey = 'pendient' | 'proceso' | 'entregad' | 'anulado' | 'todos';

interface Zona {
  id: number;
  zona: string;
}

const ESTADO_CONFIG: Record<EstadoKey, { letter: string; label: string; bg: string; shadow: string }> = {
  pendient: { letter: 'P', label: 'Pendientes', bg: 'bg-amber-500', shadow: 'shadow-amber-500/40' },
  proceso: { letter: 'C', label: 'En Curso', bg: 'bg-blue-500', shadow: 'shadow-blue-500/40' },
  entregad: { letter: 'E', label: 'Entregados', bg: 'bg-green-500', shadow: 'shadow-green-500/40' },
  anulado: { letter: 'X', label: 'Anulados', bg: 'bg-red-500', shadow: 'shadow-red-500/40' },
  todos: { letter: 'T', label: 'Todos', bg: 'bg-slate-500', shadow: 'shadow-slate-500/40' },
};

const ESTADO_ORDER: EstadoKey[] = ['pendient', 'proceso', 'entregad', 'anulado', 'todos'];

function PedidosToolbar() {
  const { filters, setFilters } = usePedidosStore();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showZonas, setShowZonas] = useState(false);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loadingZonas, setLoadingZonas] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const zonasRef = useRef<HTMLDivElement>(null);

  const currentEstado = (filters.estado as EstadoKey) || 'pendient';
  const estadoConfig = ESTADO_CONFIG[currentEstado];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setFilters({ search: value });
    }, 300);
    setSearchTimeout(timeout);
  };

  const cycleEstado = () => {
    const currentIndex = ESTADO_ORDER.indexOf(currentEstado);
    const nextIndex = (currentIndex + 1) % ESTADO_ORDER.length;
    setFilters({ estado: ESTADO_ORDER[nextIndex] });
  };

  const handleFechaChange = (value: string) => {
    setFilters({ fecha: value });
  };

  const clearSearch = () => {
    setSearchValue('');
    setFilters({ search: '' });
    setShowSearch(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Cargar zonas cuando se abre el dropdown
  useEffect(() => {
    if (showZonas && zonas.length === 0 && !loadingZonas) {
      setLoadingZonas(true);
      apiClient.get<Zona[]>(endpoints.zonas())
        .then(setZonas)
        .catch(console.error)
        .finally(() => setLoadingZonas(false));
    }
  }, [showZonas, zonas.length, loadingZonas]);

  // Cerrar dropdown de zonas al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zonasRef.current && !zonasRef.current.contains(e.target as Node)) {
        setShowZonas(false);
      }
    };
    if (showZonas) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showZonas]);

  const handleZonaSelect = (zona: string | null) => {
    setFilters({ zona: zona || '' });
    setShowZonas(false);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Fila única: Todos los controles */}
        <div className="flex items-center gap-2">
          {/* Botón de Estado cíclico */}
          <button
            onClick={cycleEstado}
            className={`
              flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-white
              transition-all duration-200 shadow-lg
              ${estadoConfig.bg} ${estadoConfig.shadow}
              hover:scale-105 active:scale-95
            `}
            title={`Estado: ${estadoConfig.label} (click para cambiar)`}
          >
            <span className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-md text-sm font-black">
              {estadoConfig.letter}
            </span>
            <span className="text-sm hidden sm:inline">{estadoConfig.label}</span>
          </button>

          {/* Espaciador flexible */}
          <div className="flex-1" />

          {/* Acciones compactas */}
          <div className="flex items-center gap-1.5">
            {/* Búsqueda toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`
                p-2.5 rounded-xl transition-all
                ${showSearch || searchValue
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                }
              `}
              title="Buscar"
            >
              <Search size={18} />
            </button>

            {/* Zona */}
            <div className="relative" ref={zonasRef}>
              <button
                onClick={() => setShowZonas(!showZonas)}
                className={`
                  p-2.5 rounded-xl transition-all
                  ${filters.zona
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                  }
                `}
                title={filters.zona ? `Zona: ${filters.zona}` : 'Filtrar por zona'}
              >
                <MapPin size={18} />
              </button>
              {filters.zona && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZonaSelect(null);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                >
                  ×
                </button>
              )}
              
              {/* Dropdown de zonas */}
              {showZonas && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a2e] border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                  <div className="p-2 border-b border-white/10">
                    <span className="text-xs text-white/50 uppercase tracking-wide">Filtrar por zona</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {loadingZonas ? (
                      <div className="p-3 text-center text-white/50 text-sm">Cargando...</div>
                    ) : zonas.length === 0 ? (
                      <div className="p-3 text-center text-white/50 text-sm">Sin zonas</div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleZonaSelect(null)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors ${!filters.zona ? 'text-primary-400 bg-primary-500/10' : 'text-white/80'}`}
                        >
                          Todas las zonas
                        </button>
                        {zonas.map((z) => (
                          <button
                            key={z.id}
                            onClick={() => handleZonaSelect(z.zona)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors ${filters.zona === z.zona ? 'text-primary-400 bg-primary-500/10' : 'text-white/80'}`}
                          >
                            {z.zona}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fecha */}
            <div className="relative">
              <input
                type="date"
                value={filters.fecha}
                onChange={(e) => handleFechaChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className={`
                  p-2.5 rounded-xl transition-all cursor-pointer
                  ${filters.fecha
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
                  }
                `}
                title={filters.fecha ? `Fecha: ${filters.fecha}` : 'Filtrar por fecha'}
              >
                <Calendar size={18} />
              </div>
              {filters.fecha && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters({ fecha: '' });
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Mapa */}
            <button
              onClick={() => navigate(ROUTES.MAPA)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
              title="Ver mapa"
            >
              <Map size={18} />
            </button>

            {/* Nuevo Pedido */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-gray-900 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
              title="Nuevo Pedido"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Fila 2: Campo de búsqueda expandible */}
        {(showSearch || searchValue) && (
          <div className="relative animate-fade-in">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por cliente o número..."
              className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Indicadores de filtros activos */}
        {(filters.fecha || filters.zona) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/50">Filtrando:</span>
            {filters.zona && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-md text-xs text-white">
                📍 {filters.zona}
                <button
                  onClick={() => setFilters({ zona: '' })}
                  className="hover:text-purple-300"
                >
                  ×
                </button>
              </span>
            )}
            {filters.fecha && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-500/20 border border-primary-500/30 rounded-md text-xs text-white">
                📅 {new Date(filters.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                <button
                  onClick={() => setFilters({ fecha: '' })}
                  className="hover:text-primary-300"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <NewPedidoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default PedidosToolbar;

