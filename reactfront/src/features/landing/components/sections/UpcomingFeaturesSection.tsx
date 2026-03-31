import { Bot, Receipt, MessageSquarePlus, Sparkles } from 'lucide-react';

const UpcomingFeaturesSection = () => {
  const WHATSAPP_NUMBER = "+5492924406159";

  const handleSuggestion = () => {
    const message = "Hola! Tengo una sugerencia para Aqua Delivery Manager:";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const upcomingFeatures = [
    {
      title: "Facturación Legal ARCA",
      desc: "Emití facturas electrónicas válidas directamente desde la App en el momento del reparto. Integración total con ARCA (ex AFIP).",
      icon: <Receipt size={24} />,
      badge: "En Desarrollo"
    },
    {
      title: "Bot de Pedidos WhatsApp",
      desc: "Un asistente virtual que recibe pedidos las 24hs y los carga automáticamente en tu hoja de ruta del día siguiente.",
      icon: <Bot size={24} />,
      badge: "En Estudio"
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#08101d]/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} /> Roadmap
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tighter">Próximamente...</h2>
          <p className="text-white/50 text-xl max-w-2xl mx-auto">No nos quedamos quietos. Estamos construyendo el futuro del soderío.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {upcomingFeatures.map((item, i) => (
            <div key={i} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
              <p className="text-white/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Suggestion CTA */}
        <div className="max-w-3xl mx-auto p-12 rounded-[40px] bg-gradient-to-r from-blue-600/10 to-transparent border border-white/5 text-center">
          <h3 className="text-2xl font-bold mb-4 text-white">¿Tu negocio necesita otra cosa?</h3>
          <p className="text-white/50 mb-8 max-w-lg mx-auto leading-relaxed">
            Queremos que Aqua DM sea la herramienta definitiva. 
            Contanos qué función te cambiaría el día a día y la estudiamos.
          </p>
          <button
            onClick={handleSuggestion}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 hover:bg-teal-500/10 text-white font-bold transition-all border border-white/10 group active:scale-95"
          >
            <MessageSquarePlus size={20} className="text-blue-400 group-hover:text-teal-400 transition-colors" />
            Enviar mi Sugerencia
          </button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingFeaturesSection;
