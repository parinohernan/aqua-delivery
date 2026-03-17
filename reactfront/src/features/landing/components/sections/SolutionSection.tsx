import { Zap, CheckCircle2, Users, PlusCircle } from 'lucide-react';

const SolutionSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Aqua Delivery Manager</h2>
        <p className="text-white/50 text-xl">Todo en tu bolsillo, en la nube</p>
      </div>

      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "En la Nube", desc: "Requiere internet y funciona online desde cualquier celular.", icon: <Zap /> },
          { title: "Sin Instalación", desc: "No necesita servidor local ni instalaciones complicadas.", icon: <CheckCircle2 /> },
          { title: "Multi-usuario", desc: "Ideal para repartidores solos o flotas grandes.", icon: <Users /> },
          { title: "Escalable", desc: "Desde 50 clientes hasta cientos de forma simple.", icon: <PlusCircle /> }
        ].map((item, i) => (
          <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
            <p className="text-white/50 leading-relaxed text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SolutionSection;
