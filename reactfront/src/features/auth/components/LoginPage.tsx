import { useState, FormEvent } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * Página de login
 * Permite al usuario autenticarse con telegramId y codigoEmpresa
 */
function LoginPage() {
  const [telegramId, setTelegramId] = useState('');
  const [codigoEmpresa, setCodigoEmpresa] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo2-min.webp" 
              alt="AquaDelivery Logo" 
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="telegramId" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña de acceso
            </label>
            <input
              type="password"
              id="telegramId"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ingresa tu contraseña de acceso"
            />
          </div>

          <div>
            <label htmlFor="codigoEmpresa" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Empresa
            </label>
            <input
              type="text"
              id="codigoEmpresa"
              value={codigoEmpresa}
              onChange={(e) => setCodigoEmpresa(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Código de empresa"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <p className="text-sm text-gray-600 text-center mt-4">
            Puedes probar la aplicación usando los siguientes datos:
            <br />
            <span className="font-medium">Contraseña: test</span>
            <br />
            <span className="font-medium">Empresa: 1</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

