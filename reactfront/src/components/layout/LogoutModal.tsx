import { useAuthStore } from '@/stores/authStore';

/**
 * Modal de confirmación de logout
 * Permite al usuario confirmar antes de cerrar sesión
 */
function LogoutModal() {
  const { isLogoutModalOpen, hideLogoutModal, performLogout } = useAuthStore();

  if (!isLogoutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={hideLogoutModal}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🚪</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Cerrar sesión?
          </h3>
          <p className="text-gray-600">
            ¿Estás seguro que deseas salir de la aplicación?
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={hideLogoutModal}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={performLogout}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;

