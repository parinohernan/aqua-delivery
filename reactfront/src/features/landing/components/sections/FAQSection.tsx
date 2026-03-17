import { HelpCircle } from 'lucide-react';

const FAQSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center flex items-center justify-center gap-3 text-white">
          <HelpCircle className="text-blue-400" />
          Dudas comunes
        </h2>
        <div className="space-y-6">
          {[
            { q: "¿Requiere internet?", a: "Sí, es SaaS en la nube – funciona con conexión (no offline por ahora)." },
            { q: "¿Necesito instalar servidor?", a: "No, todo online, sin nada local." },
            { q: "¿Sirve para empresas grandes?", a: "Sí, permite múltiples usuarios y escala bien." },
            { q: "¿Puedo tener varios repartidores?", a: "Sí, varias cuentas por empresa." },
            { q: "¿Hay contrato?", a: "No, se trata de una suscripcion que podes cancelar cuando quieras." },
            { q: "¿Prueba gratis?", a: "7 días sin tarjeta ni compromiso." }
          ].map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <h4 className="font-bold mb-2 text-blue-400">{faq.q}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
