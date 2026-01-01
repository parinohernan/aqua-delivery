import { formatCurrency } from '@/utils/formatters';
import type { ProductoInforme } from '../types';

/**
 * Tabla de productos más vendidos
 */
interface ProductosTableProps {
  productos: ProductoInforme[];
}

function ProductosTable({ productos }: ProductosTableProps) {
  if (productos.length === 0) {
    return (
      <div className="bg-[#0f1b2e]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg shadow-black/30">
        <p className="text-white/70 text-center">No hay productos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1b2e]/70 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🏆</span>
          Productos Más Vendidos
        </h3>
        <p className="text-sm text-white/70 mt-1">Top 10 productos por cantidad vendida</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                Total Vendido
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {productos.map((producto, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white/70">
                  {index + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                  {producto.descripcion}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white/80 text-right">
                  {producto.cantidad}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-white text-right">
                  {formatCurrency(producto.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductosTable;

