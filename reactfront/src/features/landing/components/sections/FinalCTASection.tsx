const FinalCTASection = () => {
  return (
    <section className="py-24 px-6 bg-blue-600 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 blur-[100px] rounded-full" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
          ¿Listo para organizar tu reparto y dejar atrás el descontrol?
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Escribime por WhatsApp o llená el formulario rápido. En minutos podés estar probando gratis.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#"
            className="w-full sm:w-auto px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl"
          >
            Consultar por WhatsApp
          </a>
          <a
            href="#"
            className="w-full sm:w-auto px-10 py-5 bg-blue-900/30 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-blue-900/50 transition-all"
          >
            Formulario de contacto
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
