import type { ReactNode } from 'react';
import { ROUTES } from '@/utils/constants';
import {
  Package,
  Users,
  ShoppingBag,
  Route,
  Map,
  MapPin,
  Receipt,
  Wallet,
  BarChart2,
  FileText,
} from 'lucide-react';

export type NavItem = {
  path: string;
  label: string;
  icon: ReactNode;
};

/** Barra lateral (desktop) y menú inferior (móvil): flujo principal diario */
export const NAV_MAIN_ITEMS: NavItem[] = [
  { path: ROUTES.PEDIDOS, label: 'Pedidos', icon: <Package size={20} /> },
  { path: ROUTES.RUTAS, label: 'Rutas', icon: <Route size={20} /> },
  { path: ROUTES.CLIENTES, label: 'Clientes', icon: <Users size={20} /> },
  { path: ROUTES.PRODUCTOS, label: 'Productos', icon: <ShoppingBag size={20} /> },
];

/** Menú desplegable del header: mapa, GPS, caja, gastos, facturación e informes */
export const NAV_MORE_ITEMS: NavItem[] = [
  { path: ROUTES.MAPA, label: 'Mapa', icon: <Map size={20} /> },
  { path: ROUTES.GPS, label: 'GPS', icon: <MapPin size={20} /> },
  { path: ROUTES.CAJA, label: 'Caja', icon: <Wallet size={20} /> },
  { path: ROUTES.EXPENSES, label: 'Gastos', icon: <Receipt size={20} /> },
  { path: ROUTES.FACTURACION, label: 'Facturación', icon: <FileText size={20} /> },
  { path: ROUTES.INFORMES, label: 'Informes', icon: <BarChart2 size={20} /> },
];
