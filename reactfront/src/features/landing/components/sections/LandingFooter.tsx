import { useNavigate } from 'react-router-dom';

const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="py-12 px-6 border-t border-white/5 text-center bg-[#050a14]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo2-min.webp" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight text-white">Aqua314</span>
        </div>
        <p className="text-white/30 text-xs tracking-widest uppercase mb-4">
          Aqua Delivery Manager • Hecho en Argentina
        </p>
        <p className="text-white/20 text-[10px]">
          Para repartidores y distribuidoras de agua • La Pampa y todo el país.
        </p>
        <div className="mt-8 flex justify-center gap-6 text-[10px] text-white/40 uppercase font-bold tracking-tighter">
          <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">ACCESO CLIENTES</button>
          <a href="#" className="hover:text-white transition-colors">TÉRMINOS</a>
          <a href="#" className="hover:text-white transition-colors">PRIVACIDAD</a>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
