import { useConfirmStore } from '@/stores/confirmStore';

/**
 * Modal de confirmación global
 * Reemplaza confirm() con un diálogo coherente con la UI
 */
function ConfirmDialog() {
  const {
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant,
    handleConfirm,
    handleCancel,
  } = useConfirmStore();

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleCancel}
        aria-hidden="true"
      />

      <div
        className="relative bg-[#0f1b2e] backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-2 border-white/20 p-6 max-w-sm w-full z-[10001]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
              isDanger ? 'bg-danger-dim' : 'bg-primary-500/20'
            }`}
          >
            <span className="text-2xl">{isDanger ? '⚠️' : '❓'}</span>
          </div>
          <h3 id="confirm-title" className="text-xl font-bold text-white mb-2">
            {title}
          </h3>
          <p id="confirm-desc" className="text-white/70 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg transition-all font-medium ${
              isDanger
                ? 'bg-danger text-white hover:bg-red-600 border border-danger/50'
                : 'bg-gradient-to-r from-primary-400 to-primary-600 text-white hover:from-primary-500 hover:to-primary-700 shadow-lg shadow-primary-500/30'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
