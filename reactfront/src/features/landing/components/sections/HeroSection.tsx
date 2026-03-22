import { Zap, MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <header className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 animate-fade-in">
          <Zap size={24} />
          <span>SOFTWARE SaaS PARA DISTRIBUIDORES DE AGUA</span>
          <img src="/drop.png" alt="Logo" className="w-8 h-8" />
        </div>
        {/* componente con camion en movimiento */}

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight animate-slide-up text-white">
          Transforma tu reparto de agua en una <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">logística profesional.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          El control total de tu negocio, deudas y envases, <span className="text-blue-400 font-bold italic">siempre en tu bolsillo.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <a
            href="https://wa.me/+5492924406159"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20 text-white"
          >
            <MessageCircle size={20} />
            WhatsApp ahora
          </a>
          <a
            href="#"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white"
          >
            Prueba gratis 7 días
            <ChevronRight size={20} />
          </a>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-white/40 text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-blue-500" /> SaaS en la nube</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-blue-500" /> Sin servidor local</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-blue-500" /> Multi-usuario</span>
          </div>
          <p className="text-blue-400 font-bold bg-blue-400/5 px-4 py-1.5 rounded-lg border border-blue-400/20">
            Solo 10.000 ARS/mes (Promo)
          </p>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
