import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Estilo del botón principal: 'danger' para acciones destructivas */
  variant?: 'default' | 'danger';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolveRef: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'default',
  resolveRef: null,

  confirm: (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmar',
        cancelLabel: options.cancelLabel ?? 'Cancelar',
        variant: options.variant ?? 'default',
        resolveRef: resolve,
      });
    });
  },

  handleConfirm: () => {
    const { resolveRef } = get();
    resolveRef?.(true);
    set({ isOpen: false, resolveRef: null });
  },

  handleCancel: () => {
    const { resolveRef } = get();
    resolveRef?.(false);
    set({ isOpen: false, resolveRef: null });
  },
}));
