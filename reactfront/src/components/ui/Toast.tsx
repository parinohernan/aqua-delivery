import { createPortal } from 'react-dom';
import { useToastStore, type ToastType } from '@/stores/toastStore';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} className="flex-shrink-0" />,
  error: <XCircle size={20} className="flex-shrink-0" />,
  info: <Info size={20} className="flex-shrink-0" />,
};

const STYLES: Record<ToastType, { bg: string; border: string; iconColor: string }> = {
  success: {
    bg: 'bg-success-dim',
    border: 'border-success/40',
    iconColor: 'text-success',
  },
  error: {
    bg: 'bg-danger-dim',
    border: 'border-danger/40',
    iconColor: 'text-danger',
  },
  info: {
    bg: 'bg-primary-500/15',
    border: 'border-primary-500/40',
    iconColor: 'text-primary-400',
  },
};

/**
 * Toast global - se renderiza en el body y muestra notificaciones
 */
function Toast() {
  const { toast, hide } = useToastStore();

  if (!toast) return null;

  const style = STYLES[toast.type];
  const icon = ICONS[toast.type];

  const content = (
    <div
      role="alert"
      className={`
        fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl
        shadow-2xl z-[10001] animate-fadeInUp
        ${style.bg} ${style.border}
      `}
    >
      <span className={style.iconColor}>{icon}</span>
      <p className="flex-1 text-sm text-white/95 leading-relaxed">{toast.message}</p>
      <button
        onClick={hide}
        className="text-white/50 hover:text-white p-1 -m-1 rounded transition-colors"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );

  return createPortal(content, document.body);
}

export default Toast;
