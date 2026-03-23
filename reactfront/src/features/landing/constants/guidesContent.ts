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
        h: "1. Conciliación Diaria: El 'Cierre de Envases'",
        p: "No esperes al fin de mes. El camión debe volver con la misma suma de (Llenos + Vacíos) con la que salió. ADM automatiza este conteo para que el repartidor no pueda 'olvidarse' bidones en el camino."
      },
      {
        h: "2. Gestión de Comodatos Digitales",
        p: "El comodato no puede ser de palabra. Registrá en el sistema exactamente cuántos envases tiene cada cliente 'prestados'. Al momento de la visita, la App le recuerda al chofer cuántos tiene que retirar."
      },
      {
        h: "3. Depósitos en Garantía Planificados",
        p: "Para clientes nuevos o de baja rotación, el depósito en garantía es vital. ADM te permite registrar estos pagos y asociarlos al envase, protegiendo tu capital desde el día uno."
      },
      {
        h: "4. Educación al Cliente por WhatsApp",
        p: "Muchos clientes no saben el valor de reposición de un bidón. Usá la integración de ADM para enviar recordatorios prolijos donde se detalle el saldo de envases pendientes de devolución."
      },
      {
        h: "5. Incentivos al Repartidor",
        p: "Convertí a tu chofer en un custodio del stock. Usá los informes técnicos de ADM para premiar a los repartidores que mantienen sus rutas con 0% de pérdida de envases al final de la semana."
      }
    ]
  },
  "digitalizacion": {
    id: "digitalizacion",
    title: "Hoja de Ruta: Del Cuaderno a la App en 7 Días",
    sections: [
      {
        h: "Día 1: Limpieza y Orden del Cuaderno",
        p: "No pases el caos al software. Agarrá el cuaderno y marcá quién debe envases hoy, quién tiene deuda de plata y quiénes son tus clientes activos. Este es el cimiento de tu nueva logística profesional."
      },
      {
        h: "Día 2: Configura tu 'Cerebro' Logístico",
        p: "Cargá tus productos (Bidón 12L, 20L, Dispenser, Sifón) y definí tus rutas. En ADM es tan simple como crear la lista de precios que querés aplicar en la calle."
      },
      {
        h: "Día 3: Del Mapa de Papel al Mapa Digital",
        p: "Cargá las direcciones de tus clientes. Por primera vez vas a visualizar dónde está tu capital (los envases) distribuido geográficamente. ADM te permite importar tu lista de contactos fácilmente."
      },
      {
        h: "Día 4: Dale Poder a tu Repartidor",
        p: "Descargá la App en el celular del chofer. Mostrale cómo marcar una entrega con dos toques. Sin papeles que se vuelan, sin lapiceras que no escriben. El chofer es tu mejor aliado en esta etapa."
      },
      {
        h: "Día 5: El Primer Reparto en Paralelo",
        p: "Hacé un día de reparto usando la App y anotando lo básico en papel 'por si las dudas'. Vas a notar que el cierre de caja de ese día es 10 veces más rápido y sin errores manuales."
      },
      {
        h: "Día 6: 100% Digital (Adiós al Papel)",
        p: "Hoy el camión sale solo con la App. Registro en tiempo real de envases que entran y salen. Control total desde tu celular (el tuyo, el del dueño) viendo el avance del reparto minuto a minuto."
      },
      {
        h: "Día 7: Analizá tu Primer Cierre de Caja Real",
        p: "Mirá tu primer informe de ventas y deudas generado automáticamente. Descubrí cuántos envases recuperaste y cuánto combustible ahorraste. ¡Felicidades, ya sos un soderío del futuro!"
      }
    ]
  },
  "ahorro-combustible": {
    id: "ahorro-combustible",
    title: "Optimización de Rutas y Ahorro de combustible",
    sections: [
      {
        h: "1. Zonificación Inteligente del Reparto",
        p: "No cruces la ciudad de punta a punta. Dividí tu zona de influencia en cuadrantes por día de la semana. ADM te permite asignar clientes a rutas fijas para que el camión no dé vueltas innecesarias."
      },
      {
        h: "2. Secuencia Lógica de Entrega (Última Milla)",
        p: "El orden de los factores sí altera el gasto de combustible. Organizá tu ruta de forma que el camión recorra la menor distancia entre el cliente A y el B. ADM optimiza ese listado con un solo click."
      },
      {
        h: "3. Optimización de Carga y Peso",
        p: "Cada bidón de 20L pesa lo mismo que un bidón de nafta en términos de consumo. Saber exactamente cuánto vas a vender hoy por ruta te permite cargar solo lo necesario, reduciendo el peso muerto y el desgaste de cubiertas."
      },
      {
        h: "4. Control Satelital de Movimientos",
        p: "Evitá desvíos para trámites personales o tiempos muertos con el motor encendido. Con el seguimiento GPS por reparto de ADM, podés auditar el recorrido real y detectar ineficiencias de forma inmediata."
      }
    ]
  }
};
