import { useState, FormEvent } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * Página de login mejorada
 * Diseño moderno con glassmorphism y botón para mostrar/ocultar contraseña
 */
function LoginPage() {
  const [telegramId, setTelegramId] = useState('');
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#050a14] p-4 relative overflow-hidden">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/20 p-8 md:p-10 animate-fade-in">
          {/* Logo y header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl"></div>
                <img 
                  src="/logo2-min.webp" 
                  alt="AquaDelivery Logo" 
                  className="relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Aqua314
            </h1>
            <p className="text-white/70 text-sm">
              Delivery Manager
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de contraseña con botón de mostrar/ocultar */}
            <div>
              <label 
                htmlFor="telegramId" 
                className="block text-sm font-semibold text-white/90 mb-2.5"
              >
                Contraseña de acceso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="telegramId"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 pr-12 bg-white/10 border-2 border-white/20 rounded-xl 
                           focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 
                           text-white placeholder-white/50 backdrop-blur-sm
                           transition-all duration-200
                           hover:border-white/30"
                  placeholder="Ingresa tu contraseña de acceso"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                           text-white/60 hover:text-white transition-colors
                           focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-lg p-1.5
                           active:scale-95"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Campo de código de empresa */}
            <div>
              <label 
                htmlFor="codigoEmpresa" 
                className="block text-sm font-semibold text-white/90 mb-2.5"
              >
                Código de Empresa
              </label>
              <input
                type="text"
                id="codigoEmpresa"
                value={codigoEmpresa}
                onChange={(e) => setCodigoEmpresa(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl 
                         focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 
                         text-white placeholder-white/50 backdrop-blur-sm
                         transition-all duration-200
                         hover:border-white/30"
                placeholder="Código de empresa"
              />
            </div>

            {/* Mensaje de error mejorado */}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/50 text-red-200 px-4 py-3.5 rounded-xl backdrop-blur-sm flex items-center gap-3 animate-slide-in">
                <svg 
                  className="w-5 h-5 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="flex-1 text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Botón de submit mejorado */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl 
                       font-bold text-base shadow-lg shadow-primary-500/30
                       hover:from-primary-600 hover:to-primary-700 
                       hover:shadow-primary-500/50 hover:scale-[1.02]
                       active:scale-[0.98]
                       transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       flex items-center justify-center gap-2
                       min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <svg 
                    className="animate-spin h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Información de prueba mejorada */}
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2 text-center">
                Datos de Prueba
              </p>
              <div className="space-y-1.5 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Contraseña:</span>
                  <span className="font-mono font-semibold text-primary-300">test</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Empresa:</span>
                  <span className="font-mono font-semibold text-primary-300">1</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

