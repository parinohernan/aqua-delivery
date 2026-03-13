import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { Package, Users, ShoppingBag, BarChart2, Route } from 'lucide-react';

/**
 * Navegación móvil
 * Muestra los botones de navegación en la parte inferior para móviles
 */
function MobileNav() {
  const navItems = [
    { path: ROUTES.PEDIDOS,   label: 'Pedidos',   icon: <Package size={22} /> },
    { path: ROUTES.RUTAS,     label: 'Rutas',     icon: <Route size={22} /> },
    { path: ROUTES.CLIENTES,  label: 'Clientes',  icon: <Users size={22} /> },
    { path: ROUTES.PRODUCTOS, label: 'Productos', icon: <ShoppingBag size={22} /> },
    { path: ROUTES.INFORMES,  label: 'Informes',  icon: <BarChart2 size={22} /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1b2e] border-t border-white/10 shadow-2xl z-40">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-3 flex-1 transition-colors ${isActive ? 'text-primary-400' : 'text-white/60'}`
            }
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
