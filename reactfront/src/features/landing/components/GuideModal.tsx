import React, { useEffect } from 'react';
import { X, BookOpen, Download } from 'lucide-react';
import { GuideContent } from '../constants/guidesContent';

interface GuideModalProps {
  guide: GuideContent | null;
  onClose: () => void;
  onOpenLeadCapture: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ guide, onClose, onOpenLeadCapture }) => {
  useEffect(() => {
    if (guide) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [guide]);

  if (!guide) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#030712]/90 backdrop-blur-md transition-all animate-in fade-in duration-300">
      <div 
        className="bg-[#0f172a] border border-white/10 w-full max-w-3xl max-h-[85vh] rounded-[40px] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#1e293b]/20 backdrop-blur-lg">
          <div className="flex items-center gap-4 text-blue-400">
            <BookOpen size={24} />
            <h2 className="text-xl font-bold text-white tracking-tight">{guide.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-12 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {guide.sections.map((sec, i) => (
            <div key={i}>
              <h3 className="text-lg font-bold text-blue-400 mb-4">{sec.h}</h3>
              <p className="text-white/60 leading-relaxed text-base font-light font-sans">
                {sec.p}
              </p>
            </div>
          ))}

          {/* Special CTA */}
          <div className="pt-12">
            <div className="p-10 rounded-[40px] bg-gradient-to-r from-blue-600/10 to-blue-500/5 border border-blue-500/20 text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4">
                 <Download size={40} className="text-blue-500/10 group-hover:text-blue-500/20 transition-all -rotate-12" />
               </div>
               
               <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Contenido Premium para Distribuidores</p>
               <h4 className="text-2xl font-bold text-white mb-6">¿Quieres la guía completa en PDF?</h4>
               <button 
                 onClick={onOpenLeadCapture}
                 className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 mx-auto"
               >
                 <Download size={18} /> Obtener Guía Completa Gratis
               </button>
            </div>
          </div>
          
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
