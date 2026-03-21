import { ShieldCheck, Database, Key } from 'lucide-react';

const TrustSection = () => {
  return (
    <section className="py-24 px-6 bg-blue-600/[0.03] border-y border-white/5 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Tu negocio es <span className="text-blue-400">tuyo</span>, tus datos también
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            Sabemos lo que valen tus rutas y tus clientes. En Aqua Delivery Manager, 
            la privacidad de tu información es nuestra prioridad innegociable.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Propiedad Total", 
              desc: "Tu base de clientes y hojas de ruta son de tu exclusiva propiedad. ADM nunca usará tu información para otros fines ni la compartirá con nadie.",
              icon: <Database className="w-6 h-6" />
            },
            { 
              title: "Seguridad Bancaria", 
              desc: "Utilizamos cifrado avanzado para proteger cada transacción y dato cargado. Solo tú y tus empleados autorizados tienen acceso.",
              icon: <Key className="w-6 h-6" />
            },
            { 
              title: "Respaldo Garantizado", 
              desc: "Realizamos backups automáticos cada 24 horas en la nube. Tus deudas y saldos históricos están protegidos ante cualquier eventualidad.",
              icon: <ShieldCheck className="w-6 h-6" />
            }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-500 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed tracking-wide">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-[40px] bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                <ShieldCheck className="text-blue-400 w-8 h-8" />
            </div>
            <div>
              <p className="text-white font-bold text-lg mb-1 italic">"Mi lista de clientes es mi capital"</p>
              <p className="text-white/40 text-sm italic">Entendemos el valor de tu esfuerzo. En ADM, lo cuidamos.</p>
            </div>
          </div>
          <div className="px-6 py-2 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-bold uppercase tracking-widest">
            Privacidad 100% Argentina
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
