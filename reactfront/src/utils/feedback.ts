/**
 * Helpers para Toast y Confirm
 * Uso: import { toast, confirm } from '@/utils/feedback';
 */

import { useToastStore } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';
import type { ConfirmOptions } from '@/stores/confirmStore';

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().success(message, duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().error(message, duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().info(message, duration),
};

export async function confirm(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().confirm(options);
}
