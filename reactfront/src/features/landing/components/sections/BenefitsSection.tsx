import { CheckCircle2 } from 'lucide-react';

const BenefitsSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
          ¿Qué ganás con Aqua Delivery Manager?
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
          {[
            "Ahorrás horas diarias dejando el cuaderno",
            "Recuperás plata de envases perdidos",
            "Reducís km y nafta con rutas inteligentes",
            "Tenés informes claros para el negocio",
            "Escalás sin drama (más repartidores)",
            "Múltiples usuarios por empresa"
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-lg text-white/80">{benefit}</span>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <p className="text-2xl font-bold text-blue-400 italic">Más control = más tranquilidad y más ganancias.</p>
          <p className="text-2xl font-bold text-blue-400 italic">Mejor atencion al cliente.</p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
