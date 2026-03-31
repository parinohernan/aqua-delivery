import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LegalModal from '../LegalModal';

const LandingFooter = () => {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  const openModal = (type: 'terms' | 'privacy') => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <footer className="py-24 px-6 border-t border-white/5 text-center bg-[#050a14] relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo2-min.webp" alt="Logo" className="w-10 h-10 opacity-70 group-hover:opacity-100 transition-opacity" />
          <span className="font-bold text-xl tracking-tight text-white/90">Aqua Delivery Manager</span>
        </div>
        
        <p className="text-white/30 text-xs tracking-widest uppercase mb-6 font-bold">
          Aqua Delivery Manager
        </p>
        
        <p className="text-white/60 text-[18px] max-w-sm mx-auto leading-relaxed mb-10">
          Software de gestión profesional para repartidores y distribuidoras de agua. 
          desarrollado por <a href="https://janus314.com.ar" target="_blank" className="text-white/90 hover:text-blue-400 transition-colors">janus314</a> - Brindando soluciones para la logística de tu negocio desde 2013.
        </p>

        <div className="flex flex-wrap justify-center gap-8 text-[11px] text-white/40 uppercase font-black tracking-widest border-t border-white/5 pt-10">          
          <button 
            onClick={() => openModal('terms')} 
            className="hover:text-white transition-all hover:scale-105"
          >
            TÉRMINOS
          </button>
          
          <button 
            onClick={() => openModal('privacy')} 
            className="hover:text-white transition-all hover:scale-105"
          >
            PRIVACIDAD
          </button>
        </div>
        
        <div className="mt-16 opacity-20 hover:opacity-100 transition-opacity">
           <p className="text-[9px] text-white/30 tracking-tighter uppercase">
             © 2026 ADM - Todos los derechos reservados.
           </p>
        </div>
      </div>

      <LegalModal 
        isOpen={modalType !== null} 
        onClose={closeModal} 
        type={modalType || 'terms'} 
      />
    </footer>
  );
};

export default LandingFooter;
