import { useAuthStore } from '@/stores/authStore';

/**
 * Modal de confirmación de logout
 * Permite al usuario confirmar antes de cerrar sesión
 */
function LogoutModal() {
  const { isLogoutModalOpen, hideLogoutModal, performLogout } = useAuthStore();

  if (!isLogoutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={hideLogoutModal}
      />
      
      {/* Modal */}
      <div className="relative bg-[#0f1b2e] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/20 p-6 max-w-sm w-full z-[101]">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🚪</div>
          <h3 className="text-xl font-bold text-white mb-2">
            ¿Cerrar sesión?
          </h3>
          <p className="text-white/70">
            ¿Estás seguro que deseas salir de la aplicación?
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={hideLogoutModal}
            className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
          >
            Cancelar
          </button>
          <button
            onClick={performLogout}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg hover:from-primary-500 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;

