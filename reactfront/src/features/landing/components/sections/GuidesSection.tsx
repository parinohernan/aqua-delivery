import { useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { GUIDES_CONTENT, GuideContent } from '../../constants/guidesContent';
import GuideModal from '../GuideModal';
import LeadCaptureModal from '../LeadCaptureModal';

const GuidesSection = () => {
  const [selectedGuide, setSelectedGuide] = useState<GuideContent | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  const guides = [
    {
      id: "perdida-envases",
      title: "Cómo reducir la pérdida de envases",
      desc: "Estrategias probadas para controlar tu capital y evitar el 'goteo' de bidones perdidos.",
      tag: "Gestión",
      time: "5 min lectura"
    },
    {
      id: "digitalizacion",
      title: "Del Cuaderno a la App en 7 días",
      desc: "Una guía paso a paso para digitalizar tu sodería sin interrumpir el reparto diario.",
      tag: "Digitalización",
      time: "8 min lectura"
    },
    {
      id: "ahorro-combustible",
      title: "Ahorro de combustible en rutas",
      desc: "Cómo el orden logístico inteligente puede bajarte un 20% los costos de nafta.",
      tag: "Eficiencia",
      time: "6 min lectura"
    }
  ];

  const handleOpenGuide = (id: string) => {
    setSelectedGuide(GUIDES_CONTENT[id] || null);
  };

  const handleOpenLeadCapture = () => {
    setSelectedGuide(null);
    setShowLeadCapture(true);
  };

  return (
    <section className="py-24 px-6 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
              Recursos para <span className="text-blue-400">crecer</span>
            </h2>
            <p className="text-white/50 text-lg">
              No solo te damos el software. Te damos el conocimiento para que tu distribuidora sea imparable.
            </p>
          </div>
          <button 
            onClick={() => setShowLeadCapture(true)}
            className="flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors group"
          >
            Ver todas las guías <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {guides.map((guide, i) => (
            <div 
              key={i} 
              onClick={() => handleOpenGuide(guide.id)}
              className="group p-8 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Subtle background icon */}
              <BookOpen className="absolute -bottom-4 -right-4 w-24 h-24 text-white/[0.02] -rotate-12 group-hover:text-blue-500/[0.05] transition-all" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                    {guide.tag}
                  </span>
                  <span className="text-white/30 text-[10px] uppercase font-medium">
                    {guide.time}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">
                  {guide.title}
                </h3>

                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  {guide.desc}
                </p>

                <div className="flex items-center gap-2 text-white/40 text-xs font-bold group-hover:text-white transition-colors">
                  LEER GUÍA <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <GuideModal 
        guide={selectedGuide} 
        onClose={() => setSelectedGuide(null)} 
        onOpenLeadCapture={handleOpenLeadCapture}
      />
      
      <LeadCaptureModal 
        isOpen={showLeadCapture} 
        onClose={() => setShowLeadCapture(false)}
        source={selectedGuide?.id}
      />
    </section>
  );
};

export default GuidesSection;

