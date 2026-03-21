import { CheckCircle2 } from 'lucide-react';

const PricingSection = () => {
  const WHATSAPP_NUMBER = "+5492924406159";

  const handlePlanSelection = (plan: string) => {
    const message = `Hola! Estoy interesado en el plan ${plan} de Aqua Delivery Manager.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-transparent to-blue-600/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Planes pensados para tu realidad</h2>
          <p className="text-white/50">Sin contratos, cancelás cuando quieras</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-6 right-6 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              33% OFF
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 text-white">Plan Starter</h3>
              <div className="mb-6">
                <span className="text-sm text-white/30 line-through mb-1 block">$15.000</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$10.000</span>
                  <span className="text-white/40 font-medium">/ mes</span>
                </div>
              </div>
              <div className="mb-8 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-blue-400 text-xs font-bold leading-tight">
                  ✨ 33% OFF ¡CONGELADO DE POR VIDA!
                </p>
                <p className="text-white/50 text-[10px] mt-1">
                  Si te registras antes del 1 de abril
                </p>
              </div>
              <ul className="space-y-4 mb-10 text-white/70">
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-white/30" /> Control total de 1 vendedor</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-white/30" /> Gestión de envases y deudas</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-white/30" /> Todas las funciones sin límites</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-white/30" /> Soporte por WhatsApp</li>
              </ul>
              <button
                onClick={() => handlePlanSelection('Starter')}
                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 font-bold transition-all text-white border border-white/5 shadow-xl"
              >
                Elegir Starter
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="p-10 rounded-[40px] bg-white/5 border border-white/20 relative overflow-hidden group transition-all hover:bg-white/[0.07]">
            <div className="absolute top-6 right-6 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              33% OFF
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 text-white">Plan Pro</h3>
              <div className="mb-6">
                <span className="text-sm text-white/30 line-through mb-1 block">$75.000</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$50.000</span>
                  <span className="text-white/40 font-medium">/ mes</span>
                </div>
              </div>
              <div className="mb-8 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-blue-400 text-xs font-bold leading-tight">
                  ✨ 33% OFF ¡CONGELADO DE POR VIDA!
                </p>
                <p className="text-white/50 text-[10px] mt-1">
                  Si te registras antes del 1 de abril
                </p>
              </div>
              <ul className="space-y-4 mb-10 text-white/70">
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-white/30" /> Hasta 10 vendedores</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-white/30" /> Gestión multi-reparto avanzada</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-white/30" /> Todas las funciones sin límites</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-white/30" /> Soporte por WhatsApp</li>
              </ul>
              <button
                onClick={() => handlePlanSelection('Pro')}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold transition-all text-white shadow-lg shadow-blue-600/20"
              >
                Elegir Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
