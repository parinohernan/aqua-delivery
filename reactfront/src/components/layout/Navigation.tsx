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
    <nav className="hidden lg:flex flex-col w-64 bg-[#0f1b2e]/80 backdrop-blur-sm border-r border-white/10 shadow-xl p-4 gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
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

