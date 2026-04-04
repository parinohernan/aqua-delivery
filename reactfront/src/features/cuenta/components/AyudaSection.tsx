import { HelpCircle, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER_DIGITS } from '@/utils/constants';

const waHref = `https://wa.me/${WHATSAPP_NUMBER_DIGITS}`;

function AyudaSection() {
  return (
    <div className="max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <HelpCircle className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Ayuda</h1>
          <p className="text-sm text-white/50">Soporte y consultas</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 space-y-4">
        <p className="text-white/70 text-sm leading-relaxed">
          Si necesitás ayuda con el uso de la app, facturación o incidencias, contactanos por WhatsApp.
        </p>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#dcf8c6] font-semibold text-sm transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  );
}

export default AyudaSection;
