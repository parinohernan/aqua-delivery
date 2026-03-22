import { XCircle, CheckCircle } from 'lucide-react';

const ComparisonSection = () => {
  return (
    <section className="py-24 px-6 bg-[#050a14] relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tighter">
            Del <span className="line-through text-white/20">CAOS</span> al <span className="text-blue-400">CONTROL</span>
          </h2>
          <p className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed">
            No es solo una App, es la transformación total de tu día a día. 
            Mira la diferencia entre la vieja escuela y el soderío del futuro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Before: Chaos */}
          <div className="rounded-[40px] p-8 bg-red-500/[0.02] border border-red-500/10 group">
            <div className="relative rounded-3xl overflow-hidden mb-8 aspect-video border border-white/5 shadow-2xl">
              <img 
                src="/chaos-notebook.webp" 
                alt="Cuaderno viejo y mojado" 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] to-transparent opacity-60" />
              <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest border border-red-500/30">
                Vieja Escuela
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <XCircle className="text-red-500" /> El Sistema del Pasado
            </h3>
            
            <ul className="space-y-4">
              {[
                "Cuadernos mojados, tachados y perdidos.",
                "Discusiones por deudas que \"no anotaste\".",
                "Envases que salen y nunca vuelven.",
                "Horas de cierre de caja cada noche.",
                "Falta de control total sobre el chofer."
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-white/40 text-sm leading-relaxed italic">
                  <span>•</span> {text}
                </li>
              ))}
            </ul>
          </div>

          {/* After: Control */}
          <div className="rounded-[40px] p-8 bg-blue-500/[0.05] border border-blue-500/20 group relative">
             {/* Highlight effect */}
            <div className="absolute inset-0 bg-blue-500/[0.02] blur-3xl rounded-full" />
            
            <div className="relative rounded-3xl overflow-hidden mb-8 aspect-video border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <img 
                src="/modern-app.webp" 
                alt="Aqua Delivery Manager App" 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
              <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-blue-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/50">
                Futuro con ADM
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <CheckCircle className="text-blue-400" /> Orden Inteligente
            </h3>
            
            <ul className="space-y-4">
              {[
                "Información en la nube para siempre.",
                "Saldos claros por WhatsApp al instante.",
                "Recuperación garantizada de envases.",
                "Cierre de caja automático (ahorro de 2hs).",
                "Control satelital de cada entrega."
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-white/80 text-sm font-medium leading-relaxed">
                  <CheckCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" /> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 text-center">
            <p className="text-white/30 text-xs uppercase tracking-widest font-bold mb-8">¿Listo para dar el salto?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="px-12 py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-600/20 text-lg">
                    Empezar mi Transformación
                </button>
                <button className="px-12 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 text-lg">
                    Descargar Guía PDF
                </button>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
