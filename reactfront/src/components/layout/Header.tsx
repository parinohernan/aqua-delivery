import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import GuardedNavLink from '@/components/navigation/GuardedNavLink';
import LogoutModal from './LogoutModal';
import { NAV_MORE_ITEMS } from './navConfig';
import { preloadAppSection } from '@/app/routePreloads';
import { ROUTES } from '@/utils/constants';
import { ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';

const userMenuLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-3 text-sm transition-colors w-full text-left ${
    isActive ? 'bg-primary-600/40 text-white' : 'text-white/85 hover:bg-white/10'
  }`;

const menuPanelClass =
  'absolute right-0 mt-2 w-56 rounded-xl bg-[#0f1b2e] border border-white/15 shadow-2xl py-1 overflow-hidden z-50';

/**
 * Header: logo, menú Más, y menú de usuario (perfil, configuración, ayuda, salir).
 */
function Header() {
  const { user, showLogoutModal } = useAuthStore();
  const nombreUsuario = user?.nombre || user?.telegramId || 'Usuario';
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const userWrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMoreOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen && !userMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (moreOpen && moreWrapRef.current && !moreWrapRef.current.contains(t)) {
        setMoreOpen(false);
      }
      if (userMenuOpen && userWrapRef.current && !userWrapRef.current.contains(t)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen, userMenuOpen]);

  const openUserMenu = () => {
    setMoreOpen(false);
    setUserMenuOpen((o) => !o);
  };

  const openMoreMenu = () => {
    setUserMenuOpen(false);
    setMoreOpen((o) => !o);
  };

  return (
    <>
      <header className="relative z-50 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-white shadow-2xl border-b border-primary-700/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 shrink-0 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <img src="/drop.png" alt="Aqua Logo" className="w-8 h-8 object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white">Aqua</h1>
              <span className="text-sm text-white/80">Delivery Manager</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative" ref={moreWrapRef}>
              <button
                type="button"
                onClick={openMoreMenu}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                aria-controls="menu-mas"
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors border border-white/20 text-sm font-medium"
              >
                <span>Más</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform shrink-0 ${moreOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {moreOpen && (
                <div id="menu-mas" role="menu" className={menuPanelClass}>
                  {NAV_MORE_ITEMS.map((item) => (
                    <GuardedNavLink
                      key={item.path}
                      to={item.path}
                      role="menuitem"
                      onMouseEnter={() => preloadAppSection(item.path)}
                      onFocus={() => preloadAppSection(item.path)}
                      onClick={() => setMoreOpen(false)}
                      className={userMenuLinkClass}
                    >
                      <span className="text-white/90 shrink-0">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </GuardedNavLink>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={userWrapRef}>
              <button
                type="button"
                onClick={openUserMenu}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-controls="menu-usuario"
                className="flex items-center gap-1.5 max-w-[200px] sm:max-w-[240px] px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors border border-white/20 text-sm font-medium min-w-0"
              >
                <span className="truncate">{nombreUsuario}</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {userMenuOpen && (
                <div id="menu-usuario" role="menu" className={menuPanelClass}>
                  <GuardedNavLink
                    to={ROUTES.PERFIL}
                    role="menuitem"
                    onMouseEnter={() => preloadAppSection(ROUTES.PERFIL)}
                    onFocus={() => preloadAppSection(ROUTES.PERFIL)}
                    onClick={() => setUserMenuOpen(false)}
                    className={userMenuLinkClass}
                  >
                    <User size={18} className="text-white/90 shrink-0" aria-hidden />
                    <span className="font-medium">Perfil</span>
                  </GuardedNavLink>
                  <GuardedNavLink
                    to={ROUTES.CONFIGURACION}
                    role="menuitem"
                    onMouseEnter={() => preloadAppSection(ROUTES.CONFIGURACION)}
                    onFocus={() => preloadAppSection(ROUTES.CONFIGURACION)}
                    onClick={() => setUserMenuOpen(false)}
                    className={userMenuLinkClass}
                  >
                    <Settings size={18} className="text-white/90 shrink-0" aria-hidden />
                    <span className="font-medium">Configuración</span>
                  </GuardedNavLink>
                  <GuardedNavLink
                    to={ROUTES.AYUDA}
                    role="menuitem"
                    onMouseEnter={() => preloadAppSection(ROUTES.AYUDA)}
                    onFocus={() => preloadAppSection(ROUTES.AYUDA)}
                    onClick={() => setUserMenuOpen(false)}
                    className={userMenuLinkClass}
                  >
                    <HelpCircle size={18} className="text-white/90 shrink-0" aria-hidden />
                    <span className="font-medium">Ayuda</span>
                  </GuardedNavLink>
                  <div className="border-t border-white/10 my-1" role="separator" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      showLogoutModal();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-rose-200 hover:bg-rose-500/15 transition-colors w-full text-left"
                  >
                    <LogOut size={18} className="shrink-0" aria-hidden />
                    <span className="font-medium">Salir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutModal />
    </>
  );
}

export default Header;
