import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import apiClient from '@/services/api/client';

type Step = 'form' | 'code' | 'done';

type ConfirmSuccess = {
  codigoEmpresa: number;
  fechaVencimiento: string;
  mensaje: string;
};

const inputClass = [
  'w-full px-4 py-3.5 rounded-xl border',
  'bg-black/30 backdrop-blur-sm text-white placeholder-white/30',
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 focus:bg-black/40',
  'hover:border-white/30 border-white/15',
].join(' ');

function StartNowPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [usaEntregaProgramada, setUsaEntregaProgramada] = useState(false);
  const [usaRepartoPorZona, setUsaRepartoPorZona] = useState(false);
  const [husoHorario, setHusoHorario] = useState('0');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [doneData, setDoneData] = useState<ConfirmSuccess | null>(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const parseApiError = (err: unknown) => {
    if (err instanceof AxiosError) {
      const data = err.response?.data as { error?: string } | undefined;
      return data?.error || err.message || 'Error inesperado';
    }
    return err instanceof Error ? err.message : 'Error inesperado';
  };

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await apiClient.post<{
        ok?: boolean;
        message?: string;
        devNote?: string;
        whatsappUrl?: string;
        emailSent?: boolean;
      }>('/api/startnow/request', {
        email: email.trim(),
        razonSocial: razonSocial.trim(),
        telegramId: telegramId.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        usaEntregaProgramada,
        usaRepartoPorZona,
        husoHorario: parseInt(husoHorario, 10) || 0,
      });
      setWhatsappUrl(res.whatsappUrl || null);
      setEmailSent(Boolean(res.emailSent));
      setInfoMessage([res.message, res.devNote].filter(Boolean).join(' '));
      setStep('code');
      setCodigo('');
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await apiClient.post<ConfirmSuccess & { ok?: boolean }>(
        '/api/startnow/confirm',
        {
          email: email.trim().toLowerCase(),
          codigo: codigo.trim(),
        }
      );
      setDoneData({
        codigoEmpresa: res.codigoEmpresa,
        fechaVencimiento: res.fechaVencimiento,
        mensaje: res.mensaje,
      });
      setStep('done');
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const vencimientoLabel =
    doneData?.fechaVencimiento &&
    new Date(doneData.fechaVencimiento).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#050a14] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden px-6">
            <div className="pt-7 pb-5 text-center -mx-6 px-6 border-b border-white/10">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-2xl blur-lg" />
                  <div className="relative bg-white rounded-xl p-2.5 shadow-lg shadow-black/30">
                    <img
                      src="/logo2-min.webp"
                      alt="AquaDelivery Logo"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Crear empresa</h1>
              <p className="text-white/50 text-sm mt-1">
                Prueba gratuita 15 días · código por WhatsApp (o email si está configurado)
              </p>
            </div>

            <div className="py-6">
              {step === 'form' && (
                <form onSubmit={handleRequest} className="space-y-4">
                  <div>
                    <label htmlFor="razonSocial" className="block text-sm font-medium text-white/70 mb-2">
                      Razón social / nombre de empresa
                    </label>
                    <input
                      id="razonSocial"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      required
                      maxLength={100}
                      className={inputClass}
                      placeholder="Ej. Distribuidora Los Manantiales"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className={inputClass}
                      placeholder="tu@correo.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="telegramIdSn" className="block text-sm font-medium text-white/70 mb-2">
                      Contraseña de acceso
                    </label>
                    <input
                      id="telegramIdSn"
                      type="password"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={inputClass}
                      placeholder="Mismo valor que usarás en el inicio de sesión"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-white/70 mb-2">
                        Nombre
                      </label>
                      <input
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        maxLength={50}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="apellido" className="block text-sm font-medium text-white/70 mb-2">
                        Apellido
                      </label>
                      <input
                        id="apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        maxLength={50}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usaEntregaProgramada}
                        onChange={(e) => setUsaEntregaProgramada(e.target.checked)}
                        className="rounded border-white/30 bg-black/30 text-blue-500 focus:ring-blue-500/40"
                      />
                      Entrega programada
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usaRepartoPorZona}
                        onChange={(e) => setUsaRepartoPorZona(e.target.checked)}
                        className="rounded border-white/30 bg-black/30 text-blue-500 focus:ring-blue-500/40"
                      />
                      Reparto por zona
                    </label>
                  </div>
                  <div>
                    <label htmlFor="huso" className="block text-sm font-medium text-white/70 mb-2">
                      Huso horario (opcional, horas respecto a UTC)
                    </label>
                    <input
                      id="huso"
                      type="number"
                      min={-12}
                      max={14}
                      value={husoHorario}
                      onChange={(e) => setHusoHorario(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  {error && (
                    <div className="bg-red-500/15 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Guardando…' : 'Continuar'}
                  </button>
                </form>
              )}

              {step === 'code' && (
                <form onSubmit={handleConfirm} className="space-y-4">
                  <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-4 space-y-3">
                    <p className="text-white text-sm leading-relaxed">
                      <span className="font-semibold text-white">Solicite su código por WhatsApp</span>
                      {' '}indicando la misma razón social que ingresó:{' '}
                      <span className="text-blue-200 font-medium">«{razonSocial.trim()}»</span>.
                    </p>
                    {emailSent && (
                      <p className="text-white/60 text-xs">
                        También le enviamos el código a{' '}
                        <span className="text-white/80">{email.trim()}</span>.
                      </p>
                    )}
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/30 transition-colors"
                      >
                        Abrir WhatsApp
                      </a>
                    )}
                  </div>

                  <div>
                    <label htmlFor="codigo" className="block text-sm font-medium text-white mb-2">
                      Ingréselo aquí
                    </label>
                    <p className="text-white/45 text-xs mb-2">
                      Código de 8 letras y números. Si es correcto, se crea su empresa con la prueba gratuita.
                    </p>
                    <input
                      id="codigo"
                      value={codigo}
                      onChange={(e) =>
                        setCodigo(
                          e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                        )
                      }
                      required
                      minLength={8}
                      maxLength={8}
                      autoComplete="one-time-code"
                      inputMode="text"
                      className={`${inputClass} font-mono tracking-widest text-center text-lg`}
                      placeholder="________"
                      aria-label="Ingrese aquí el código de 8 letras y números"
                    />
                  </div>
                  {infoMessage && (
                    <p className="text-blue-300/90 text-xs border border-blue-500/30 rounded-lg px-3 py-2 bg-blue-500/10">
                      {infoMessage}
                    </p>
                  )}
                  {error && (
                    <div className="bg-red-500/15 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
                  >
                    {isLoading ? 'Creando empresa…' : 'Confirmar y crear empresa'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setError('');
                      setInfoMessage('');
                      setWhatsappUrl(null);
                      setEmailSent(false);
                    }}
                    className="w-full text-sm text-white/50 hover:text-white/80 py-2"
                  >
                    Volver y editar datos
                  </button>
                </form>
              )}

              {step === 'done' && doneData && (
                <div className="space-y-4 text-center">
                  <div className="text-green-400 text-sm font-medium">Empresa creada</div>
                  <p className="text-white/80 text-sm">{doneData.mensaje}</p>
                  <div className="bg-black/25 rounded-xl border border-white/10 px-4 py-3 text-left text-sm space-y-2">
                    <p className="text-white/60">
                      Código de empresa:{' '}
                      <span className="text-white font-mono font-bold text-lg">
                        {doneData.codigoEmpresa}
                      </span>
                    </p>
                    <p className="text-white/60">
                      Prueba hasta: <span className="text-white">{vencimientoLabel}</span>
                    </p>
                  </div>
                  <p className="text-white/50 text-xs">
                    Iniciá sesión con tu contraseña de acceso y este código de empresa.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex w-full justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold"
                  >
                    Ir al inicio de sesión
                  </Link>
                </div>
              )}
            </div>

            <div className="pb-6 text-center border-t border-white/10 -mx-6 px-6 pt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs text-blue-400/70 hover:text-blue-400 transition-colors"
              >
                ¿Ya tenés cuenta? Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartNowPage;
