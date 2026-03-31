import { ShoppingBag, Users, Box, Map, BarChart, CalendarCheck } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-[#08101d]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Las herramientas que usás todos los días</h2>
          <p className="text-white/50">Diseñado específicamente para el reparto de agua</p>
        </div>

        <div className="grid md:grid-cols-1 gap-12">
          {[
            {
              title: "1. Pedidos",
              desc: "Crear, modificar, anular y marcar como entregados. Registro rápido y seguimiento completo de cada pedido.",
              icon: <ShoppingBag size={32} />,
              features: ["Visualización clara", "Seguimiento de estado", "Anulaciones simples"]
            },
            {
              title: "2. Clientes",
              desc: "Gestión completa: dirección, teléfono y asignación a rutas. Historial de entregas y control de deudas.",
              icon: <Users size={32} />,
              features: ["Ficha técnica", "Asignación de ruta", "Estado de deuda"]
            },
            {
              title: "3. Productos",
              desc: "Control de stock, precios y marcas de retornables. Control automático de entradas y salidas.",
              icon: <Box size={32} />,
              features: ["Gestión de stock", "Control retornables", "Precios unitarios"]
            },
            {
              title: "4. Rutas",
              desc: "Orden de entrega optimizado por cliente y ruta. Visualización del recorrido diario y contacto rápido.",
              icon: <Map size={32} />,
              features: ["Recorrido óptimo", "Vista diaria", "WhatsApp directo"]
            },
            {
              title: "5. Informes",
              desc: "Reportes de ventas, deudas y stock. Exportación a Excel para una contabilidad sin errores.",
              icon: <BarChart size={32} />,
              features: ["Reportes por fecha", "Totales por repartidor", "Exportar Excel"]
            },
            {
              title: "6. Alquileres",
              desc: "Gestión de alquileres de dispenser y equipos. Control de fechas de vencimiento y recordatorios de cobro automáticos.",
              icon: <CalendarCheck size={32} />,
              features: ["Control de equipos", "Vencimientos abonos", "Recordatorios de cobro"]
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-start p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-white/60 mb-6 text-lg leading-relaxed">{item.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {item.features.map((f, fi) => (
                    <span key={fi} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/50 italic">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
