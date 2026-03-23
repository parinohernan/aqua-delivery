import { useState, FormEvent } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [telegramId, setTelegramId] = useState('');
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [shake, setShake] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ telegramId, codigoEmpresa });
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapsLock = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#050a14] relative">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-8">
        <div className={`w-full max-w-sm animate-fade-in ${shake ? 'animate-shake' : ''}`}>

          {/*
            Card: px-6 propio para que todos los hijos respeten el padding.
            Los divisores usan -mx-6 para extenderse borde a borde y
            luego px-6 para re-agregar el padding de su contenido.
          */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden px-6">

            {/* ── Header ── */}
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
              <h1 className="text-2xl font-bold text-white">Aqua314</h1>
              <p className="text-white/50 text-xs tracking-widest uppercase mt-0.5">Delivery Manager</p>
            </div>

            {/* ── Formulario ── */}
            <div className="py-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Contraseña */}
                <div>
                  <label htmlFor="telegramId" className="block text-sm font-medium text-white/70 mb-2">
                    Contraseña de acceso
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="telegramId"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      onKeyDown={handleCapsLock}
                      onKeyUp={handleCapsLock}
                      required
                      autoFocus
                      placeholder="Ingresa tu contraseña"
                      className={[
                        'w-full pl-11 pr-12 py-3.5 rounded-xl border',
                        'bg-black/30 backdrop-blur-sm text-white placeholder-white/30',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 focus:bg-black/40',
                        'hover:border-white/30',
                        telegramId ? 'border-white/35' : 'border-white/15',
                      ].join(' ')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg focus:outline-none active:scale-95"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {capsLockOn && (
                    <p className="mt-1.5 text-xs text-amber-400/80 flex items-center gap-1.5 animate-slide-in">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Bloq Mayús activado
                    </p>
                  )}
                </div>

                {/* Código empresa */}
                <div>
                  <label htmlFor="codigoEmpresa" className="block text-sm font-medium text-white/70 mb-2">
                    Código de Empresa
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="codigoEmpresa"
                      value={codigoEmpresa}
                      onChange={(e) => setCodigoEmpresa(e.target.value)}
                      required
                      placeholder="Código de empresa"
                      className={[
                        'w-full pl-11 pr-4 py-3.5 rounded-xl border',
                        'bg-black/30 backdrop-blur-sm text-white placeholder-white/30',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 focus:bg-black/40',
                        'hover:border-white/30',
                        codigoEmpresa ? 'border-white/35' : 'border-white/15',
                      ].join(' ')}
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/15 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 animate-slide-in">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Botón */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 min-h-[52px]"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* ── Datos de prueba ── */}
            <div className="pt-4 pb-5 -mx-6 px-6 border-t border-white/10">
              <p className="text-xs text-white/35 uppercase tracking-widest text-center mb-2.5">Datos de Prueba</p>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Contraseña: <span className="font-mono text-blue-300/70">test</span></span>
                <span className="text-white/40">Empresa: <span className="font-mono text-blue-300/70">1</span></span>
              </div>
            </div>

            {/* ── Footer / Más Info ── */}
            <div className="pt-4 pb-6 text-center space-y-2">
              <button
                type="button"
                onClick={() => navigate('/startnow')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1.5 mx-auto font-medium"
              >
                <span>Crear empresa · prueba 15 días</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button 
                onClick={() => navigate('/info')}
                className="text-xs text-blue-400/60 hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <span>¿No tenés cuenta? Conocé AquaDelivery</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
