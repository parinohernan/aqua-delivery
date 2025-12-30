import { useEffect } from 'react';
import { useClientesStore } from '../stores/clientesStore';
import ClientesToolbar from './ClientesToolbar';
import ClientesList from './ClientesList';
import ClienteModal from './ClienteModal';
import ClientPaymentModal from './ClientPaymentModal';

/**
 * Sección de Clientes
 * Componente principal para la gestión de clientes
 */
function ClientesSection() {
  const { loadClientes, isLoading, error } = useClientesStore();

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>👥</span>
          Gestión de Clientes
        </h2>
        <p className="text-gray-600 mt-1">
          Administra tu base de datos de clientes de manera eficiente
        </p>
      </div>

      <ClientesToolbar />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <ClientesList isLoading={isLoading} />

      <ClienteModal />
      <ClientPaymentModal />
    </div>
  );
}

export default ClientesSection;
