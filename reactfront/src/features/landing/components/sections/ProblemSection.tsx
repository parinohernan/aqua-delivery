import { XOctagon } from 'lucide-react';

const ProblemSection = () => {
  return (
    <section className="py-24 px-6 bg-[#08101d]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              El caos diario que te está <span className="text-red-400">costando caro</span>
            </h2>
            <ul className="space-y-4">
              {[
                "Cuadernos que se pierden, mojan o se vuelven ilegibles",
                "No sabés exactamente quién te debe ni cuántos bidones faltan",
                "Rutas improvisadas que te hacen gastar combustible de más",
                "Pedidos que se olvidan al terminar el reparto",
                "Envases perdidos y no son baratos"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-white/70">
                  <XOctagon size={24} className="text-red-500/50 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xl font-medium text-white/90 italic">
              Si esto te suena familiar… es hora de cambiar.
            </p>
          </div>
          {/* <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-500/20 to-transparent border border-white/5 flex items-center justify-center overflow-hidden">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <XOctagon size={32} className="text-red-400" />
                </div>
                <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Sin Control</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
