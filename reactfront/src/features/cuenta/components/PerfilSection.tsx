import { useState, FormEvent } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { User as UserIcon, KeyRound, Loader2, ShieldOff } from 'lucide-react';
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/utils/constants';
import type { User } from '@/types/entities';
import type { AxiosError } from 'axios';

function fmt(v: unknown): string {
  if (v == null || v === '') return '—';
  return String(v);
}

const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-white/15 bg-black/25 text-white text-sm placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50';

/**
 * Datos básicos del vendedor y cambio de contraseña de acceso.
 */
function PerfilSection() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const u = user as Record<string, unknown> | null;
  const vendorCodigo = Number(u?.codigo);
  const passwordChangeBlocked = vendorCodigo === 1 && !Number.isNaN(vendorCodigo);

  const rows: [string, unknown][] = [
    ['Nombre', u?.nombre],
    ['Apellido', u?.apellido],
    ['Empresa (código)', u?.codigoEmpresa],
    ['Razón social', u?.razonSocial],
    ['Rol', u?.rol],
  ];

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwOk, setPwOk] = useState('');

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwOk('');

    if (newPassword.length < 4) {
      setPwError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setPwLoading(true);
    try {
      await apiClient.post<{ success?: boolean; message?: string }>(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      setPwOk('Contraseña actualizada. Usá la nueva en el próximo inicio de sesión.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (user) {
        const next = { ...user } as Record<string, unknown>;
        delete next.telegramId;
        setUser(next as User);
        localStorage.setItem('user', JSON.stringify(next));
      }
    } catch (err) {
      const ax = err as AxiosError<{ error?: string }>;
      const msg = ax.response?.data?.error || 'No se pudo cambiar la contraseña.';
      setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-in fade-in duration-500 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary-500/20 text-primary-300 border border-primary-500/30">
            <UserIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Perfil</h1>
            <p className="text-sm text-white/50">Datos de tu cuenta en esta sesión</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] divide-y divide-white/10 overflow-hidden">
          {rows.map(([label, val]) => (
            <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
              <span className="text-white/50">{label}</span>
              <span className="text-white font-medium text-right break-all">{fmt(val)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
        <div className="flex items-center gap-2 text-white font-semibold mb-1">
          <KeyRound className="w-5 h-5 text-amber-400/90" aria-hidden />
          Cambiar contraseña
        </div>
        {passwordChangeBlocked ? (
          <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
            <ShieldOff className="w-5 h-5 shrink-0 text-white/45" aria-hidden />
            <p>Esta cuenta no permite cambiar la contraseña desde la aplicación.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-white/45 mb-4">
              Es la misma contraseña que usás para iniciar sesión en la app.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label htmlFor="pw-current" className="block text-xs text-white/55 mb-1">
              Contraseña actual
            </label>
            <input
              id="pw-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pw-new" className="block text-xs text-white/55 mb-1">
              Nueva contraseña
            </label>
            <input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pw-confirm" className="block text-xs text-white/55 mb-1">
              Repetir nueva contraseña
            </label>
            <input
              id="pw-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {pwError ? (
            <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-lg px-3 py-2">
              {pwError}
            </p>
          ) : null}
          {pwOk ? (
            <p className="text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-2">
              {pwOk}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pwLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/40 text-amber-100 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Guardar nueva contraseña
          </button>
        </form>
          </>
        )}
      </div>
    </div>
  );
}

export default PerfilSection;
