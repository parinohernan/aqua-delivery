import type { MouseEvent } from 'react';
import { NavLink, useLocation, useResolvedPath, type NavLinkProps } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { useRutasOrdenStore } from '@/stores/rutasOrdenStore';

/**
 * Desde /rutas, si hay orden de reparto sin guardar, abre el diálogo antes de navegar.
 */
function GuardedNavLink({ to, onClick, ...rest }: NavLinkProps) {
  const location = useLocation();
  const resolved = useResolvedPath(to);
  const ordenDirty = useRutasOrdenStore((s) => s.ordenDirty);
  const openPending = useRutasOrdenStore((s) => s.openPending);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (location.pathname !== ROUTES.RUTAS || !ordenDirty) return;
    if (resolved.pathname === location.pathname) return;
    e.preventDefault();
    const href = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    openPending({ kind: 'nav', to: href });
  };

  return <NavLink to={to} onClick={handleClick} {...rest} />;
}

export default GuardedNavLink;
