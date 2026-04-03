import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import GuardedNavLink from '@/components/navigation/GuardedNavLink';
import LogoutModal from './LogoutModal';
import { NAV_MORE_ITEMS } from './navConfig';
import { preloadAppSection } from '@/app/routePreloads';
import { ChevronDown } from 'lucide-react';

/**
 * Header de la aplicación
 * Logo, título, menú "Más" (Mapa, GPS, Caja, Gastos, Informes) y cierre de sesión
 */
function Header() {
  const { user, showLogoutModal } = useAuthStore();
  const nombreUsuario = user?.nombre || user?.telegramId || 'Usuario';
  const [moreOpen, setMoreOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  return (
    <>
      <header className="relative z-50 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-white shadow-2xl border-b border-primary-700/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 shrink-0 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <img
                src="/drop.png"
                alt="Aqua Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white">Aqua</h1>
              <span className="text-sm text-white/80">Delivery Manager</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="relative" ref={wrapRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors border border-white/20 text-sm font-medium"
              >
                <span>Más</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f1b2e] border border-white/15 shadow-2xl py-1 overflow-hidden"
                >
                  {NAV_MORE_ITEMS.map((item) => (
                    <GuardedNavLink
                      key={item.path}
                      to={item.path}
                      role="menuitem"
                      onMouseEnter={() => preloadAppSection(item.path)}
                      onFocus={() => preloadAppSection(item.path)}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary-600/40 text-white'
                            : 'text-white/85 hover:bg-white/10'
                        }`
                      }
                    >
                      <span className="text-white/90 shrink-0">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </GuardedNavLink>
                  ))}
                </div>
              )}
            </div>

            <span className="text-sm hidden md:inline text-white/90 max-w-[140px] truncate">
              Hola, {nombreUsuario}
            </span>
            <button
              onClick={showLogoutModal}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors border border-white/20 shrink-0"
              title="Cerrar sesión"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
              </svg>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <LogoutModal />
    </>
  );
}

export default Header;
