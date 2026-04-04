import { Settings } from 'lucide-react';

function ConfiguracionSection() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
          <Settings className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-white/65 text-sm leading-relaxed">
          Próximamente podrás ajustar preferencias de la aplicación desde aquí.
        </p>
      </div>
    </div>
  );
}

export default ConfiguracionSection;
