import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Route, MapPin } from 'lucide-react';
import { rutasService } from '../services/rutasService';
import { useZonasStore } from '@/stores/zonasStore';
import RutaOrdenList from './RutaOrdenList';
import type { ClienteConOrden } from '@/types/entities';
import { useRutasOrdenStore } from '@/stores/rutasOrdenStore';
import { ROUTES } from '@/utils/constants';

function RutasSection() {
  const location = useLocation();
  const ordenDirty = useRutasOrdenStore((s) => s.ordenDirty);
  const openPending = useRutasOrdenStore((s) => s.openPending);

  const zonas = useZonasStore((s) => s.zonas);
  const loadingZonas = useZonasStore((s) => s.isLoading);
  const loadZonas = useZonasStore((s) => s.loadZonas);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>('');
  const [clientes, setClientes] = useState<ClienteConOrden[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [showZonaDropdown, setShowZonaDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadZonas().catch(console.error);
  }, [loadZonas]);

  useEffect(() => {
    if (!zonaSeleccionada) {
      setClientes([]);
      return;
    }
    setLoadingClientes(true);
    rutasService.getClientesConOrdenByZona(zonaSeleccionada)
      .then((data) => setClientes(data))
      .catch(console.error)
      .finally(() => setLoadingClientes(false));
  }, [zonaSeleccionada]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowZonaDropdown(false);
      }
    };
    if (showZonaDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showZonaDropdown]);

  useEffect(() => {
    const fn = (zona: string) => {
      setZonaSeleccionada(zona);
      setShowZonaDropdown(false);
    };
    useRutasOrdenStore.getState().registerZonaCommit(fn);
    return () => useRutasOrdenStore.getState().registerZonaCommit(null);
  }, []);

  useEffect(() => {
    if (location.pathname !== ROUTES.RUTAS || !ordenDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [location.pathname, ordenDirty]);

  const handleRefetch = () => {
    if (!zonaSeleccionada) return;
    rutasService.getClientesConOrdenByZona(zonaSeleccionada).then(setClientes);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Route size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Orden de reparto</h1>
        </div>
      </div>

      <p className="text-white/60 text-sm mb-4">
        Elegí una zona y definí el orden en que se visitan los clientes. Este orden se usa al listar pedidos por zona.
      </p>

      <div className="mb-6 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-white mb-2">Zona</label>
        <button
          type="button"
          onClick={() => setShowZonaDropdown(!showZonaDropdown)}
          className="w-full sm:w-72 flex items-center justify-between gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/15"
        >
          <span className="flex items-center gap-2">
            <MapPin size={18} />
            {zonaSeleccionada || 'Seleccionar zona...'}
          </span>
          <span className="text-white/50">▼</span>
        </button>
        {showZonaDropdown && (
          <div className="absolute mt-1 w-full sm:w-72 bg-[#1a1a2e] border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden">
            {loadingZonas ? (
              <div className="p-3 text-center text-white/50 text-sm">Cargando zonas...</div>
            ) : zonas.length === 0 ? (
              <div className="p-3 text-center text-white/50 text-sm">Sin zonas</div>
            ) : (
              zonas.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => {
                    if (z.zona === zonaSeleccionada) {
                      setShowZonaDropdown(false);
                      return;
                    }
                    if (ordenDirty) {
                      openPending({ kind: 'zona', zona: z.zona });
                      setShowZonaDropdown(false);
                      return;
                    }
                    setZonaSeleccionada(z.zona);
                    setShowZonaDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors ${zonaSeleccionada === z.zona ? 'bg-primary-500/20 text-primary-300' : 'text-white/90'}`}
                >
                  {z.zona}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {zonaSeleccionada && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Ruta: {zonaSeleccionada}</h2>
          {loadingClientes ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500/30 border-t-primary-500" />
            </div>
          ) : (
            <RutaOrdenList
              zona={zonaSeleccionada}
              clientes={clientes}
              onSaved={handleRefetch}
            />
          )}
        </div>
      )}

      {!zonaSeleccionada && (
        <div className="p-8 text-center border border-white/10 rounded-xl bg-white/5">
          <Route size={48} className="mx-auto text-white/30 mb-3" />
          <p className="text-white/60">Seleccioná una zona para ver y editar el orden de reparto</p>
        </div>
      )}
    </div>
  );
}

export default RutasSection;
