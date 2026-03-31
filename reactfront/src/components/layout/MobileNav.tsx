import GuardedNavLink from '@/components/navigation/GuardedNavLink';
import { ROUTES } from '@/utils/constants';
import { preloadAppSection } from '@/app/routePreloads';
import { Package, Users, ShoppingBag, BarChart2, Route } from 'lucide-react';

/**
 * Navegación móvil
 * En móvil: solo iconos para que entren 5 ítems sin apretar. title para accesibilidad.
 */
function MobileNav() {
  const navItems = [
    { path: ROUTES.PEDIDOS,   label: 'Pedidos',   icon: <Package size={20} /> },
    { path: ROUTES.RUTAS,     label: 'Rutas',     icon: <Route size={20} /> },
    { path: ROUTES.CLIENTES,  label: 'Clientes',  icon: <Users size={20} /> },
    { path: ROUTES.PRODUCTOS, label: 'Productos', icon: <ShoppingBag size={20} /> },
    { path: ROUTES.INFORMES,  label: 'Informes',  icon: <BarChart2 size={20} /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1b2e] border-t border-white/10 shadow-2xl z-40 safe-area-pb">
      <div className="flex justify-around items-center px-0 py-2 min-h-[56px]">
        {navItems.map((item) => (
          <GuardedNavLink
            key={item.path}
            to={item.path}
            title={item.label}
            onTouchStart={() => preloadAppSection(item.path)}
            onFocus={() => preloadAppSection(item.path)}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 px-1 rounded-lg transition-colors min-h-[48px] touch-manipulation ${isActive ? 'text-primary-400' : 'text-white/60 active:bg-white/10'}`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-tight truncate w-full text-center">
              {item.label}
            </span>
          </GuardedNavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
