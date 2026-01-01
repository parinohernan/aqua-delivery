import { formatCurrency, formatFullName } from '@/utils/formatters';
import { useState } from 'react';
import ClienteDetalleModal from './ClienteDetalleModal';
import type { ClienteDetallado } from '../types';

/**
 * Tabla/Tarjetas de clientes con detalles
 * Versión optimizada para móviles con tarjetas y modal
 */
interface ClientesTableProps {
  clientes: ClienteDetallado[];
}

function ClientesTable({ clientes }: ClientesTableProps) {
  const [selectedCliente, setSelectedCliente] = useState<ClienteDetallado | null>(null);

  if (clientes.length === 0) {
    return (
      <div className="bg-[#0f1b2e]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg shadow-black/30">
        <p className="text-white/70 text-center">No hay clientes para mostrar</p>
      </div>
    );
  }

  const handleClienteClick = (cliente: ClienteDetallado) => {
    setSelectedCliente(cliente);
  };

  return (
    <>
      <div className="bg-[#0f1b2e]/70 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👥</span>
            Informe Detallado por Cliente
          </h3>
          <p className="text-sm text-white/70 mt-1">
            {clientes.length} {clientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
          </p>
        </div>

        {/* Lista de clientes en tarjetas (mobile-friendly) */}
        <div className="divide-y divide-white/10">
          {clientes.map((cliente) => {
            const nombreCompleto = formatFullName(cliente.nombre, cliente.apellido);

            return (
              <div
                key={cliente.codigo}
                onClick={() => handleClienteClick(cliente)}
                className="p-4 sm:p-6 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                {/* Tarjeta compacta del cliente */}
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>

                  {/* Información principal */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-base sm:text-lg truncate">
                      {nombreCompleto}
                    </h4>
                    {cliente.telefono && (
                      <p className="text-sm text-white/70 truncate">📞 {cliente.telefono}</p>
                    )}
                  </div>

                  {/* Estadísticas compactas */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-shrink-0">
                    <div className="text-right sm:text-center">
                      <p className="text-xs text-white/70 mb-0.5">Pedidos</p>
                      <p className="text-base sm:text-lg font-semibold text-white">
                        {cliente.totalPedidos}
                      </p>
                    </div>
                    <div className="text-right sm:text-center">
                      <p className="text-xs text-white/70 mb-0.5">Total</p>
                      <p className="text-sm sm:text-base font-semibold text-white">
                        {formatCurrency(cliente.totalComprado)}
                      </p>
                    </div>
                    <div className="hidden sm:block text-center">
                      <p className="text-xs text-white/70 mb-0.5">Productos</p>
                      <p className="text-base font-semibold text-white">
                        {cliente.productos.length}
                      </p>
                    </div>
                  </div>

                  {/* Icono de flecha */}
                  <div className="text-white/50 flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Indicador de productos en móvil */}
                <div className="sm:hidden mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-white/70">
                    {cliente.productos.length} {cliente.productos.length === 1 ? 'producto' : 'productos'} • {cliente.pedidos.length} {cliente.pedidos.length === 1 ? 'pedido' : 'pedidos'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de detalles */}
      <ClienteDetalleModal
        isOpen={selectedCliente !== null}
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
      />
    </>
  );
}

export default ClientesTable;
