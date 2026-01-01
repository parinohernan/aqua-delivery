import { useClientesStore } from '../stores/clientesStore';
import ClienteCard from './ClienteCard';
import { formatCurrency, formatFullName } from '@/utils/formatters';

/**
 * Lista de clientes
 * Muestra la lista de clientes filtrados
 */
interface ClientesListProps {
  isLoading: boolean;
}

function ClientesList({ isLoading }: ClientesListProps) {
  const { filteredClientes } = useClientesStore();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-white/70">Cargando clientes...</p>
      </div>
    );
  }

  if (filteredClientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h4 className="text-xl font-semibold text-white mb-2">
          No se encontraron clientes
        </h4>
        <p className="text-white/70">Intenta con otros filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredClientes.map((cliente) => (
        <ClienteCard key={cliente.id} cliente={cliente} />
      ))}
    </div>
  );
}

export default ClientesList;

