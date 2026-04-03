import GuardedNavLink from '@/components/navigation/GuardedNavLink';
import { preloadAppSection } from '@/app/routePreloads';
import { NAV_MAIN_ITEMS } from './navConfig';

/**
 * Navegación principal (Desktop)
 * Flujo principal; Mapa, GPS, Caja, Gastos e Informes están en el menú del header.
 */
function Navigation() {
  return (
    <nav className="hidden lg:flex flex-col w-64 bg-[#0f1b2e]/80 backdrop-blur-sm border-r border-white/10 shadow-xl p-4 gap-2">
      {NAV_MAIN_ITEMS.map((item) => (
        <GuardedNavLink
          key={item.path}
          to={item.path}
          onMouseEnter={() => preloadAppSection(item.path)}
          onFocus={() => preloadAppSection(item.path)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          {item.icon}
          <span className="font-medium">{item.label}</span>
        </GuardedNavLink>
      ))}
    </nav>
  );
}

export default Navigation;
