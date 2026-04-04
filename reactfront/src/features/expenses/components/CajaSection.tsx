import React, { useEffect, useMemo, useState } from 'react';
import { useCashStore } from '../stores/cashStore';
import { useAuthStore } from '@/stores/authStore';
import {
  Wallet,
  ArrowDownCircle,
  Lock,
  Unlock,
  RefreshCw,
  TrendingUp,
  Banknote,
  ArrowLeftRight,
  History,
  Scale,
} from 'lucide-react';
import type { CajaListSession } from '../services/cashService';
import OpenCajaModal from './OpenCajaModal';
import CloseCajaModal from './CloseCajaModal';

function fmtMoney(n: number) {
  return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

function formatCajaOption(s: CajaListSession): string {
  const open = new Date(s.fechaApertura);
  const openStr = open.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  const est = String(s.estado).toLowerCase() === 'abierta' ? 'Abierta' : 'Cerrada';
  const vendor = [s.vendedorNombre, s.vendedorApellido].filter(Boolean).join(' ');
  const suffix = vendor ? ` · ${vendor}` : '';
  return `#${s.id} · ${openStr} · ${est}${suffix}`;
}

const selectClass =
  'w-full max-w-xl px-4 py-3 bg-[#121225] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50';

const CajaSection: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = String(user?.rol || '').toLowerCase() === 'admin';

  const {
    activeSession,
    summary,
    sessions,
    viewingSessionId,
    isLoading,
    isSummaryLoading,
    fetchActiveSession,
    fetchSessions,
    setViewingSession,
    refreshSummary,
  } = useCashStore();

  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    fetchActiveSession();
    fetchSessions();
  }, [fetchActiveSession, fetchSessions]);

  const showCloseCaja = Boolean(
    activeSession &&
      (viewingSessionId == null || Number(viewingSessionId) === Number(activeSession.id))
  );

  const isBrowsingHistory = Boolean(
    viewingSessionId != null && Number(viewingSessionId) !== Number(activeSession?.id)
  );

  const viewedSessionMeta = useMemo(() => {
    if (viewingSessionId == null) return null;
    return sessions.find((x) => Number(x.id) === Number(viewingSessionId)) ?? null;
  }, [sessions, viewingSessionId]);

  if (isLoading && !activeSession && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">Cargando estado de caja...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-400" />
            Caja Diaria
          </h1>
          <p className="text-gray-400 mt-1">
            {activeSession
              ? `Tu sesión abierta desde las ${new Date(activeSession.fechaApertura).toLocaleString('es-AR')}`
              : 'No tenés una sesión de caja abierta'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              refreshSummary();
              fetchSessions();
            }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95"
            title="Refrescar balance"
          >
            <RefreshCw className={`w-5 h-5 text-blue-400 ${isLoading || isSummaryLoading ? 'animate-spin' : ''}`} />
          </button>

          {showCloseCaja ? (
            <button
              type="button"
              onClick={() => setIsClosing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 transition-all font-semibold shadow-lg shadow-red-500/10 active:scale-95"
            >
              <Lock className="w-5 h-5" />
              Cerrar Caja
            </button>
          ) : !activeSession ? (
            <button
              type="button"
              onClick={() => setIsOpening(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Unlock className="w-5 h-5" />
              Abrir Caja
            </button>
          ) : null}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <History className="w-5 h-5 text-blue-400" />
          Historial de cajas
        </div>
        <p className="text-xs text-white/45">
          {isAdmin
            ? 'Como administrador podés ver las cajas de todos los vendedores de la empresa.'
            : 'Solo se listan tus propias sesiones de caja.'}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            className={selectClass}
            value={viewingSessionId == null ? '' : String(viewingSessionId)}
            onChange={(e) => {
              const v = e.target.value;
              void setViewingSession(v === '' ? null : Number(v));
            }}
          >
            <option value="">
              {activeSession
                ? 'Vista actual: mi caja abierta'
                : 'Elegí una sesión para ver su resumen…'}
            </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#1a1a2e]">
                {formatCajaOption(s)}
              </option>
            ))}
          </select>
          {isBrowsingHistory ? (
            <button
              type="button"
              onClick={() => void setViewingSession(null)}
              className="px-4 py-3 rounded-xl border border-white/15 text-sm text-white/90 hover:bg-white/10 whitespace-nowrap"
            >
              {activeSession ? 'Volver a mi caja actual' : 'Volver'}
            </button>
          ) : null}
        </div>
      </div>

      {isBrowsingHistory ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100/95 text-sm">
          Estás viendo una sesión del historial (solo lectura).
          {viewedSessionMeta
            ? ` ${[viewedSessionMeta.vendedorNombre, viewedSessionMeta.vendedorApellido].filter(Boolean).join(' ')}`
            : ''}
        </div>
      ) : null}

      {isSummaryLoading ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/10 bg-white/5">
          <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Cargando resumen…</p>
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <SummaryCard
              title="Monto Inicial"
              amount={summary.montoInicial || 0}
              icon={<Wallet className="w-5 h-5" />}
              color="blue"
            />
            <SummaryCard
              title="Cobranzas (Contado)"
              hint="Suma al efectivo en caja"
              amount={summary.totalCobrosContado ?? summary.totalCobros ?? 0}
              icon={<Banknote className="w-5 h-5" />}
              color="green"
            />
            <SummaryCard
              title="Otros pagos"
              hint="Transferencias y otros medios · no suman al arqueo"
              amount={summary.totalCobrosOtros || 0}
              icon={<ArrowLeftRight className="w-5 h-5" />}
              color="amber"
            />
            <SummaryCard
              title="Gastos de Caja"
              amount={summary.totalGastos || 0}
              icon={<ArrowDownCircle className="w-5 h-5" />}
              color="red"
            />
            <SummaryCard
              title="Balance Esperado"
              hint="Inicial + contado − gastos"
              amount={summary.balanceEsperado || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              color="purple"
              highlight
            />
          </div>

          {String(summary.estado).toLowerCase() === 'cerrada' ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Scale className="w-5 h-5 text-violet-400" />
                Arqueo al cierre
              </div>
              {summary.fechaCierre ? (
                <p className="text-xs text-white/50">
                  Cerrada el{' '}
                  {new Date(summary.fechaCierre).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              ) : null}
              {summary.montoEsperadoAlCierre != null && !Number.isNaN(summary.montoEsperadoAlCierre) ? (
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-white/55">Efectivo esperado al cerrar</span>
                  <span className="font-bold text-white tabular-nums">{fmtMoney(summary.montoEsperadoAlCierre)}</span>
                </div>
              ) : null}
              {summary.montoRealEntregado != null && !Number.isNaN(summary.montoRealEntregado) ? (
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-white/55">Efectivo entregado (contado)</span>
                  <span className="font-bold text-white tabular-nums">{fmtMoney(summary.montoRealEntregado)}</span>
                </div>
              ) : null}
              {summary.diferenciaArqueo != null && !Number.isNaN(summary.diferenciaArqueo) ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    Math.abs(summary.diferenciaArqueo) < 1
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                      : summary.diferenciaArqueo > 0
                        ? 'border-sky-500/35 bg-sky-500/10 text-sky-200'
                        : 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {Math.abs(summary.diferenciaArqueo) < 1 ? (
                    <span className="font-semibold">Cuadró con el esperado (diferencia menor a $1).</span>
                  ) : summary.diferenciaArqueo > 0 ? (
                    <span className="font-semibold">
                      Sobró {fmtMoney(summary.diferenciaArqueo)} respecto del esperado al cierre.
                    </span>
                  ) : (
                    <span className="font-semibold">
                      Faltaron {fmtMoney(Math.abs(summary.diferenciaArqueo))} respecto del esperado al cierre.
                    </span>
                  )}
                </div>
              ) : summary.montoEsperadoAlCierre == null && summary.montoRealEntregado == null ? (
                <p className="text-sm text-white/45">No hay montos de cierre guardados para esta sesión.</p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : !activeSession && viewingSessionId == null ? (
        <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-2xl text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Empieza tu jornada</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Abrí la caja con el monto inicial en efectivo. También podés elegir una sesión anterior en el historial para
            ver su resumen.
          </p>
          <button
            type="button"
            onClick={() => setIsOpening(true)}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20"
          >
            Abrir Caja Ahora
          </button>
        </div>
      ) : null}

      <OpenCajaModal isOpen={isOpening} onClose={() => setIsOpening(false)} />

      {summary && showCloseCaja ? (
        <CloseCajaModal
          isOpen={isClosing}
          onClose={() => setIsClosing(false)}
          expectedAmount={summary.balanceEsperado}
        />
      ) : null}
    </div>
  );
};

interface CardProps {
  title: string;
  hint?: string;
  amount: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'amber';
  highlight?: boolean;
}

const SummaryCard: React.FC<CardProps> = ({ title, hint, amount, icon, color, highlight }) => {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    red: 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400',
    purple: 'from-violet-500/20 to-violet-600/5 border-violet-500/30 text-violet-400',
    amber: 'from-amber-500/15 to-amber-600/5 border-amber-500/30 text-amber-400',
  };

  return (
    <div
      className={`p-6 rounded-2xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm ${highlight ? 'ring-2 ring-violet-500/50 scale-105 md:scale-100 lg:scale-105' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <span className="text-sm font-medium uppercase tracking-wider opacity-80 block">{title}</span>
          {hint ? <span className="text-[10px] text-white/45 leading-tight block mt-1">{hint}</span> : null}
        </div>
        <div className={`p-2 rounded-lg bg-white/10 shrink-0 ${colors[color].split(' ')[2]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-black text-white">
        ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export default CajaSection;
