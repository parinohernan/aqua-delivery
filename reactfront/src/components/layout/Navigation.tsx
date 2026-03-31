import GuardedNavLink from '@/components/navigation/GuardedNavLink';
import { ROUTES } from '@/utils/constants';
import { preloadAppSection } from '@/app/routePreloads';
import { Package, Users, ShoppingBag, BarChart2, Route } from 'lucide-react';

/**
 * Navegación principal (Desktop)
 * Muestra los botones de navegación para las diferentes secciones
 */
function Navigation() {
  const navItems = [
    { path: ROUTES.PEDIDOS,   label: 'Pedidos',   icon: <Package size={20} /> },
    { path: ROUTES.RUTAS,     label: 'Rutas',     icon: <Route size={20} /> },
    { path: ROUTES.CLIENTES,  label: 'Clientes',  icon: <Users size={20} /> },
    { path: ROUTES.PRODUCTOS, label: 'Productos', icon: <ShoppingBag size={20} /> },
    { path: ROUTES.INFORMES,  label: 'Informes',  icon: <BarChart2 size={20} /> },
  ];

  return (
    <nav className="hidden lg:flex flex-col w-64 bg-[#0f1b2e]/80 backdrop-blur-sm border-r border-white/10 shadow-xl p-4 gap-2">
      {navItems.map((item) => (
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
