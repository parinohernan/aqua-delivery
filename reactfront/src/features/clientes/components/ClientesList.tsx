import { UsersRound } from 'lucide-react';
import { useClientesStore } from '../stores/clientesStore';
import ClienteCard from './ClienteCard';

interface ClientesListProps {
  isLoading: boolean;
}

function ClientesList({ isLoading }: ClientesListProps) {
  const { filteredClientes } = useClientesStore();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0,209,255,0.2)',
            borderTopColor: '#00D1FF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Cargando clientes...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (filteredClientes.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0',
          gap: '12px',
        }}
      >
        <UsersRound size={40} color="#4B5563" />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#E2E8F0', margin: 0 }}>
          No se encontraron clientes
        </h4>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0 }}>
          Intenta con otros filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      {filteredClientes.map((cliente) => (
        <ClienteCard key={cliente.id} cliente={cliente} />
      ))}
    </div>
  );
}

export default ClientesList;
