import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import apiClient from '@/services/api/client';

const inputClass = [
  'w-full px-4 py-3.5 rounded-xl border',
  'bg-black/30 backdrop-blur-sm text-white placeholder-white/30',
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 focus:bg-black/40',
  'hover:border-white/30 border-white/15',
].join(' ');

/**
 * Página oculta: genera el mismo código de 8 letras y números que el flujo /startnow
 * (HMAC del nombre de empresa). Uso interno hasta tener mail.
 */
function GetCodePage() {
  const [razonSocial, setRazonSocial] = useState('');
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parseApiError = (err: unknown) => {
    if (err instanceof AxiosError) {
      const data = err.response?.data as { error?: string } | undefined;
      return data?.error || err.message || 'Error inesperado';
    }
    return err instanceof Error ? err.message : 'Error inesperado';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCodigo(null);
    setIsLoading(true);
    try {
      const res = await apiClient.post<{ ok?: boolean; codigo: string }>(
        '/api/startnow/preview-code',
        { razonSocial: razonSocial.trim() }
      );
      setCodigo(res.codigo);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const copy = () => {
    if (codigo) void navigator.clipboard.writeText(codigo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1b2e] to-[#050a14] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden px-6">
            <div className="pt-7 pb-5 text-center -mx-6 px-6 border-b border-white/10">
              <h1 className="text-xl font-bold text-white">Código de verificación</h1>
              <p className="text-white/45 text-xs mt-2">
                Uso interno · mismo nombre de empresa que en el alta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="py-6 space-y-4">
              <div>
                <label htmlFor="gcRazon" className="block text-sm font-medium text-white/70 mb-2">
                  Razón social / nombre de empresa
                </label>
                <input
                  id="gcRazon"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  required
                  maxLength={100}
                  className={inputClass}
                  placeholder="Exactamente como lo cargó el cliente"
                  autoComplete="off"
                />
              </div>
              {error && (
                <div className="bg-red-500/15 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              {codigo && (
                <div className="bg-black/30 rounded-xl border border-white/10 px-4 py-4 text-center space-y-2">
                  <p className="text-white/50 text-xs uppercase tracking-wider">Código (8 caracteres)</p>
                  <p className="font-mono text-2xl tracking-[0.2em] text-amber-200/95">{codigo}</p>
                  <button
                    type="button"
                    onClick={copy}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Copiar
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-600/90 to-amber-700 text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
              >
                {isLoading ? 'Generando…' : 'Obtener código'}
              </button>
            </form>

            <div className="pb-6 text-center border-t border-white/10 -mx-6 px-6 pt-4 space-y-2">
              <Link to="/startnow" className="text-xs text-blue-400/80 hover:text-blue-400 block">
                Volver a crear empresa
              </Link>
              <Link to="/login" className="text-xs text-white/40 hover:text-white/60 block">
                Inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetCodePage;
