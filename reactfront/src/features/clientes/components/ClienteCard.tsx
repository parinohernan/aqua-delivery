import { useState } from 'react';
import { useClientesStore } from '../stores/clientesStore';
import { formatCurrency, formatFullName } from '@/utils/formatters';
import ClienteModal from './ClienteModal';
import ClientPaymentModal from './ClientPaymentModal';
import type { Cliente } from '@/types/entities';

/**
 * Tarjeta de cliente
 * Muestra la información de un cliente
 */
interface ClienteCardProps {
  cliente: Cliente;
}

function ClienteCard({ cliente }: ClienteCardProps) {
  const { deleteCliente } = useClientesStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const nombreCompleto = formatFullName(cliente.nombre, cliente.apellido);
  const saldo = cliente.saldo || 0;
  const retornables = cliente.retornables || 0;
  const saldoClass = saldo > 0 ? 'bg-red-100 text-red-800' : saldo < 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  const saldoText = saldo > 0 ? 'Debe' : saldo < 0 ? 'A favor' : 'Al día';

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteCliente(cliente.id);
      } catch (error) {
        alert('Error eliminando cliente');
      }
    }
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-3xl">
          👤
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-gray-900">{nombreCompleto}</h4>
            <span className={`px-2 py-1 rounded text-xs font-medium ${saldoClass}`}>
              {saldoText}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            {cliente.telefono && (
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>{cliente.telefono}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span>{formatCurrency(saldo)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span>{retornables} ret.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span>✏️</span>
          <span>Editar</span>
        </button>
        <button
          onClick={handlePayment}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <span>💳</span>
          <span>Cobrar</span>
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          <span>🗑️</span>
        </button>
      </div>

      {/* Modal de Edición */}
      <ClienteModal
        isOpen={showEditModal}
        cliente={cliente}
        onClose={() => setShowEditModal(false)}
      />

      {/* Modal de Pago */}
      <ClientPaymentModal
        isOpen={showPaymentModal}
        cliente={cliente}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
}

export default ClienteCard;

