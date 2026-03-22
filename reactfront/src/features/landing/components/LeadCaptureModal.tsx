import React, { useEffect, useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose, source }) => {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-[#030712]/95 backdrop-blur-xl transition-all animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[50px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 transition-all border border-white/5"
        >
          <X size={20} />
        </button>

        <div className="p-12 text-center">
          {!isDone ? (
            <>
              <div className="w-20 h-20 rounded-[30px] bg-blue-600/10 flex items-center justify-center text-blue-400 mx-auto mb-8 border border-blue-500/20 shadow-2xl">
                 <Send size={32} className="animate-bounce-slow" />
              </div>
              
              <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                Obtén la guía <span className="text-blue-400 font-black">completa</span> gratis
              </h2>
              
              <p className="text-white/50 mb-10 text-lg">
                Te enviaremos el manual estratégico para distribuidores directamente a tu WhatsApp. No te pierdas el siguiente nivel de tu negocio.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input 
                  type="tel" 
                  placeholder="Tu WhatsApp (ej: +549...)" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 outline-none transition-all text-center text-lg font-bold"
                />
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-xl shadow-blue-600/20 text-lg uppercase tracking-widest disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Descargar Guía Ahora"}
                </button>
                
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">
                  🔒 No enviamos spam. Solo contenido de valor estratégico para distribuidores.
                </p>
              </form>
            </>
          ) : (
            <div className="py-10 animate-in fade-in zoom-in-95 duration-500">
               <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)] border border-green-500/30">
                 <CheckCircle2 size={40} />
               </div>
               
               <h2 className="text-3xl font-bold text-white mb-4">¡Enviado con éxito!</h2>
               <p className="text-white/50 text-lg mb-10 leading-relaxed">
                 Te hemos enviado el acceso a la guía por WhatsApp. ¡Asegúrate de revisar tus mensajes!
               </p>
               
               <button 
                onClick={onClose}
                className="w-full py-5 rounded-3xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
               >
                 Volver a la web
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureModal;
