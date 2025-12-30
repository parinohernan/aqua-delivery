import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

/**
 * Navegación móvil
 * Muestra los botones de navegación en la parte inferior para móviles
 */
function MobileNav() {
  const navItems = [
    { path: ROUTES.PEDIDOS, label: 'Pedidos', icon: '📦' },
    { path: ROUTES.CLIENTES, label: 'Clientes', icon: '👥' },
    { path: ROUTES.PRODUCTOS, label: 'Productos', icon: '🛍️' },
    { path: ROUTES.INFORMES, label: 'Informes', icon: '📊' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-3 flex-1 transition-colors ${
                isActive ? 'text-primary-500' : 'text-gray-600'
              }`
            }
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;

