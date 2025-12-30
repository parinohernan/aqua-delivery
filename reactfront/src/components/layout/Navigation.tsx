import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

/**
 * Navegación principal (Desktop)
 * Muestra los botones de navegación para las diferentes secciones
 */
function Navigation() {
  const navItems = [
    { path: ROUTES.PEDIDOS, label: 'Pedidos', icon: '📦' },
    { path: ROUTES.CLIENTES, label: 'Clientes', icon: '👥' },
    { path: ROUTES.PRODUCTOS, label: 'Productos', icon: '🛍️' },
    { path: ROUTES.INFORMES, label: 'Informes', icon: '📊' },
  ];

  return (
    <nav className="hidden lg:flex flex-col w-64 bg-white shadow-lg p-4 gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default Navigation;

