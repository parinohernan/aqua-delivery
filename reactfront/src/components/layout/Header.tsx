import { useAuthStore } from '@/stores/authStore';
import LogoutModal from './LogoutModal';

/**
 * Header de la aplicación
 * Muestra el logo, título y botón de logout
 */
function Header() {
  const { user, showLogoutModal } = useAuthStore();
  const nombreUsuario = user?.nombre || user?.telegramId || 'Usuario';

  return (
    <>
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <img 
                src="/drop.png" 
                alt="Aqua Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Aqua314</h1>
              <span className="text-sm text-primary-100">Delivery Manager</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:inline">
              Hola, {nombreUsuario}
            </span>
            <button
              onClick={showLogoutModal}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
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

