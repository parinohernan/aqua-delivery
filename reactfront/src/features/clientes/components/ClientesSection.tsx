import { useEffect, useState } from 'react';
import { useClientesStore } from '../stores/clientesStore';
import ClientesToolbar from './ClientesToolbar';
import ClientesList from './ClientesList';
import ClienteModal from './ClienteModal';
import ClientPaymentModal from './ClientPaymentModal';
import type { Cliente } from '@/types/entities';

/**
 * Sección de Clientes
 * Componente principal para la gestión de clientes
 */
function ClientesSection() {
  const { loadClientes, isLoading, error } = useClientesStore();
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return (
    <div className="bg-[#0f1b2e]/60 backdrop-blur-sm rounded-xl shadow-2xl border border-white/10 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>👥</span>
          Gestión de Clientes
        </h2>
        <p className="text-white/70 mt-1">
          Administra tu base de datos de clientes de manera eficiente
        </p>
      </div>

      <ClientesToolbar onNewClient={() => setIsNewClientModalOpen(true)} />

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 backdrop-blur-sm">
          {error}
        </div>
      )}

      <ClientesList isLoading={isLoading} />

      {/* Modal para crear nuevo cliente */}
      <ClienteModal
        isOpen={isNewClientModalOpen}
        cliente={null}
        onClose={() => setIsNewClientModalOpen(false)}
      />
    </div>
  );
}

export default ClientesSection;
