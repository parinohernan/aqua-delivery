import type { LucideIcon } from 'lucide-react';
import {
  Fuel,
  ShieldAlert,
  Wrench,
  Settings2,
  ReceiptText,
  Route,
  CircleParking,
  UtensilsCrossed,
} from 'lucide-react';

/** Slugs típicos (seed SQL) */
const SLUG_MAP: Record<string, LucideIcon> = {
  fuel: Fuel,
  fine: ShieldAlert,
  repair: Wrench,
  maintenance: Settings2,
  general: ReceiptText,
  toll: Route,
  parking: CircleParking,
  food: UtensilsCrossed,
};

/** Valores históricos del campo `icon` en API */
const API_ICON_MAP: Record<string, LucideIcon> = {
  fuel: Fuel,
  'alert-triangle': ShieldAlert,
  wrench: Wrench,
  settings: Settings2,
  receipt: ReceiptText,
  milestone: Route,
  'square-parking': CircleParking,
  utensils: UtensilsCrossed,
};

export function resolveExpenseTypeIcon(
  slug?: string | null,
  apiIcon?: string | null
): LucideIcon {
  if (slug) {
    const s = slug.toLowerCase();
    if (SLUG_MAP[s]) return SLUG_MAP[s];
  }
  if (apiIcon) {
    const k = apiIcon.toLowerCase();
    if (API_ICON_MAP[k]) return API_ICON_MAP[k];
  }
  return ReceiptText;
}

export interface ExpenseTypeIconDisplayProps {
  slug?: string | null;
  icon?: string | null;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function ExpenseTypeIconDisplay({
  slug,
  icon,
  className,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}: ExpenseTypeIconDisplayProps) {
  const Icon = resolveExpenseTypeIcon(slug, icon);
  return (
    <Icon
      className={className}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      aria-hidden
    />
  );
}
