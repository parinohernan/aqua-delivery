import { FileText, Sparkles } from 'lucide-react';

/**
 * Placeholder: emisión de comprobantes fiscales vía ARCA (ex AFIP).
 */
function FacturacionSection() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
          <FileText className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Facturación</h1>
        <p className="text-white/70 text-sm leading-relaxed mb-6">
          Próximamente podrás realizar facturas legales a ARCA desde la aplicación.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400/80" aria-hidden />
          <span>Estamos trabajando en esta función</span>
        </div>
      </div>
    </div>
  );
}

export default FacturacionSection;
