import { useNavigate } from 'react-router-dom';

const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a1628]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/drop.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight text-white">Aqua Delivery Manager</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
        >
        </button>
      </div>
    </nav>
  );
};

export default LandingNavbar;
