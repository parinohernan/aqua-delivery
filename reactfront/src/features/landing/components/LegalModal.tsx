import React, { useEffect, useRef } from 'react';
import { X, Shield, Scale } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = {
    terms: {
      title: "Términos y Condiciones",
      icon: <Scale className="text-blue-400" size={24} />,
      sections: [
        {
          h: "1. El Servicio (SaaS)",
          p: "Aqua Delivery Manager (ADM) provee una plataforma en la nube para la gestión de repartos. El acceso es mediante suscripción mensual prepaga."
        },
        {
          h: "2. Suscripciones y Pagos",
          p: "Los precios congelados de pre-lanzamiento (registros antes del 1 de abril) se mantienen mientras la cuenta esté activa. La falta de pago resultará en la suspensión del acceso tras previo aviso."
        },
        {
          h: "3. Responsabilidad",
          p: "ADM provee la herramienta pero no se responsabiliza por errores operativos del usuario, pérdidas económicas del negocio o problemas de conexión del cliente."
        },
        {
          h: "4. Cancelación",
          p: "Puedes cancelar tu suscripción en cualquier momento desde tu panel. No se realizan reembolsos por períodos ya facturados."
        }
      ]
    },
    privacy: {
      title: "Política de Privacidad",
      icon: <Shield className="text-blue-400" size={24} />,
      sections: [
        {
          h: "1. Propiedad de la Información",
          p: "Toda la base de datos de clientes, saldos e historiales cargados por el usuario pertenecen exclusivamente al usuario. ADM no comercializa ni usa esta información para otros fines."
        },
        {
          h: "2. Datos recolectados",
          p: "Recolectamos datos de contacto (WhatsApp/Email) del administrador y datos operativos del negocio (rutas, clientes, deudas) para el correcto funcionamiento del sistema."
        },
        {
          h: "3. Seguridad y Backups",
          p: "Los datos se almacenan de forma segura bajo cifrado y se realizan copias de seguridad automáticas diarias para garantizar la integridad de la información."
        },
        {
          h: "4. Geolocalización",
          p: "Solo se utiliza la ubicación del dispositivo para optimizar rutas y registrar entregas, siempre con autorización previa del repartidor."
        }
      ]
    }
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#030712]/90 backdrop-blur-md transition-all animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="bg-[#0f172a] border border-white/10 w-full max-w-2xl max-h-[85vh] rounded-[40px] shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#1e293b]/20 backdrop-blur-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              {active.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">{active.title}</h2>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">Sugerimos leer con atención</p>
            </div>
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
          {active.sections.map((sec, i) => (
            <div key={i} className="group">
              <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></span>
                {sec.h}
              </h3>
              <p className="text-white/60 leading-relaxed text-base font-light">
                {sec.p}
              </p>
            </div>
          ))}

          {/* Special Stamp */}
          <div className="pt-8 border-t border-white/5">
            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
               <div className="flex-1 text-sm text-white/40 italic">
                 Este documento es una bace técnica de ADM. Para validez legal definitiva, será consultado con asesoría jurídica local.
               </div>
            </div>
          </div>
          
          <div className="h-8"></div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-[#0f172a]/80 backdrop-blur-xl border-t border-white/5 flex justify-center">
          <button 
            onClick={onClose}
            className="px-10 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
