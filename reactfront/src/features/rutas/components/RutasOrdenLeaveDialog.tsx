import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRutasOrdenStore } from '@/stores/rutasOrdenStore';

/**
 * Diálogo global al salir de Rutas con orden sin guardar (navegación o cambio de zona).
 */
function RutasOrdenLeaveDialog() {
  const navigate = useNavigate();
  const pendingAction = useRutasOrdenStore((s) => s.pendingAction);
  const clearPending = useRutasOrdenStore((s) => s.clearPending);
  const saveOrderFn = useRutasOrdenStore((s) => s.saveOrderFn);
  const [saving, setSaving] = useState(false);

  const open = pendingAction !== null;

  const finishNavOrZona = () => {
    const st = useRutasOrdenStore.getState();
    const pa = st.pendingAction;
    clearPending();
    if (!pa) return;
    if (pa.kind === 'nav') navigate(pa.to);
    if (pa.kind === 'zona') st.zonaCommitFn?.(pa.zona);
  };

  const handleGuardar = async () => {
    if (!pendingAction) return;
    try {
      setSaving(true);
      await saveOrderFn?.();
      finishNavOrZona();
    } catch {
      // toast ya lo muestra el guardado
    } finally {
      setSaving(false);
    }
  };

  const handleDescartar = () => {
    finishNavOrZona();
  };

  const handleCancelar = () => {
    clearPending();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        aria-label="Cerrar"
        onClick={handleCancelar}
      />
      <div
        className="relative bg-[#0f1b2e] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/20 p-6 max-w-md w-full z-[10003]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rutas-leave-title"
      >
        <h3 id="rutas-leave-title" className="text-lg font-bold text-white mb-2">
          ¿Guardar el orden de reparto?
        </h3>
        <p className="text-white/70 text-sm mb-6 leading-relaxed">
          Tenés cambios sin guardar en el orden de la ruta. ¿Querés guardarlos antes de salir?
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={handleCancelar}
            disabled={saving}
            className="order-3 sm:order-1 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 disabled:opacity-50"
          >
            Seguir editando
          </button>
          <button
            type="button"
            onClick={handleDescartar}
            disabled={saving}
            className="order-2 px-4 py-2.5 text-amber-200/95 rounded-lg hover:bg-amber-500/15 border border-amber-500/35 disabled:opacity-50"
          >
            Salir sin guardar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={saving}
            className="order-1 sm:order-3 px-4 py-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg font-medium hover:from-primary-500 hover:to-primary-700 disabled:opacity-50 shadow-lg shadow-primary-500/30"
          >
            {saving ? 'Guardando…' : 'Guardar y salir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RutasOrdenLeaveDialog;
