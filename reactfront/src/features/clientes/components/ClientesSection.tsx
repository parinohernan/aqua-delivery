import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useClientesStore } from '../stores/clientesStore';
import ClientesToolbar from './ClientesToolbar';
import ClientesList from './ClientesList';
import ClienteModal from './ClienteModal';

/**
 * Sección de Clientes
 */
function ClientesSection() {
  const { ensureClientesLoaded, isLoading, error } = useClientesStore();
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  useEffect(() => {
    ensureClientesLoaded().catch(console.error);
  }, [ensureClientesLoaded]);

  return (
    <div
      style={{
        background: '#161B22',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        padding: '24px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: 0,
          }}
        >
          <Users size={22} color="#00D1FF" />
          Gestión de Clientes
        </h2>
        <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '0.875rem' }}>
          Administra tu base de datos de clientes
        </p>
      </div>

      <ClientesToolbar onNewClient={() => setIsNewClientModalOpen(true)} />

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#FCA5A5',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <ClientesList isLoading={isLoading} />

      <ClienteModal
        isOpen={isNewClientModalOpen}
        cliente={null}
        onClose={() => setIsNewClientModalOpen(false)}
      />
    </div>
  );
}

export default ClientesSection;

