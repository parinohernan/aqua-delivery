export interface GuideContent {
  id: string;
  title: string;
  sections: {
    h: string;
    p: string;
  }[];
}

export const GUIDES_CONTENT: Record<string, GuideContent> = {
  "perdida-envases": {
    id: "perdida-envases",
    title: "Estrategias para reducir la pérdida de envases",
    sections: [
      {
        h: "El Capital del Distribuidor",
        p: "Los bidones son el activo más valioso de tu logística. Perderlos es perder rentabilidad directa. La clave está en la conciliación diaria."
      },
      {
        h: "Control por Cliente",
        p: "ADM te permite asignar saldos de envases a cada cliente. Al llegar, el repartidor sabe exactamente cuántos bidones debe retirar."
      },
      {
        h: "Depósitos en Garantía",
        p: "Para nuevos clientes, el sistema facilita el registro de depósitos, asegurando que el envase siempre tenga un respaldo económico."
      }
    ]
  },
  "digitalizacion": {
    id: "digitalizacion",
    title: "Manual de Digitalización: Del Cuaderno a la App",
    sections: [
      {
        h: "Elimina la Doble Carga",
        p: "No más pasar en limpio al final del día. Con la App, cada venta conciliada en la calle ya está en tu sistema de gestión."
      },
      {
        h: "Transición sin Vueltas",
        p: "Manejamos la carga inicial de tus clientes. Empieza a usar el sistema en paralelo 3 días y verás la diferencia en el orden."
      },
      {
        h: "Facilidad para el Repartidor",
        p: "La App es intuitiva y está diseñada para ser usada con una sola mano, bajo el sol o la lluvia, sin complicaciones."
      }
    ]
  },
  "ahorro-combustible": {
    id: "ahorro-combustible",
    title: "Optimización de Rutas y Ahorro de combustible",
    sections: [
      {
        h: "Rutas Inteligentes",
        p: "Agrupa tus clientes por zonas lógicas. ADM te ayuda a no cruzar la ciudad de punta a punta sin sentido."
      },
      {
        h: "Carga Exacta del Camión",
        p: "Saber cuánto vas a vender hoy te permite cargar solo lo necesario, reduciendo el peso y el consumo del vehículo."
      },
      {
        h: "Días de Visita Fijos",
        p: "Establece frecuencias de paso profesionales. El sistema les avisa a tus repartidores quiénes son prioridad cada día."
      }
    ]
  }
};
