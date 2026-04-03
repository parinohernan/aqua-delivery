import { usePeriodicGpsCheck } from '../hooks/usePeriodicGpsCheck';

/**
 * Sin UI: monta el hook de registro GPS periódico en el árbol autenticado.
 */
function PeriodicGpsRegistrar() {
  usePeriodicGpsCheck();
  return null;
}

export default PeriodicGpsRegistrar;
