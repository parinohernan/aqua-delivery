# 🏁 Guía de Onboarding Perfecta: "Del Papel a la Nube"

Esta guía define el flujo que debe seguir un nuevo cliente de **Aqua Delivery Manager (ADM)** para garantizar que no abandone la plataforma por fricción técnica. Nuestra filosofía: **Fricción Cero, Valor Inmediato.**

---

## 🎯 1. La Activación: El "Quick Win" (<3 min)
No pedimos datos aburridos al principio. Queremos que el usuario vea el sistema "vivo".

*   **Paso 1: Identidad.** ¿Cómo se llama tu reparto? (Ej: "Soda El Sol").
*   **Paso 2: Valor base.** ¿A cuánto vendes el bidón de 20L hoy? (Ej: "$4500").
*   **Paso 3: El Cliente Amigo.** Cargá los datos de un cliente que ya conozcas de memoria.
*   **Paso 4: El Registro Mágico.** Marcá que le entregaste 2 y te devolvió 2 envases. 
    *   **Feedback Visual:** Aparece un cartel: *"¡Felicidades! Acabás de registrar tu primera venta digital. Tu stock se descontó 2 unidades y tu caja sumó $9000 automáticamente."*

---

## 📈 2. Progreso Visual: El "Camino del Distribuidor"
Utilizaremos una barra de progreso persistente en el dashboard hasta que se complete (0/4).

1.  **[ ] Configuración Inicial:** Definí tus productos y precios base.
2.  **[ ] Tu Primer Ruta:** Creá una ruta (ej: "Lunes Centro") y asignale al menos 3 clientes.
3.  **[ ] Carga de Stock:** Decile al sistema cuántos envases tenés hoy en tu depósito.
4.  **[ ] Invitación a Repartidor:** Si tenés empleados, enviales el link para que bajen la App.

---

## 💡 3. Ayuda Contextual (Just-In-Time)
La ayuda aparece donde está el problema, no en un manual aparte.

*   **Pantallas Vacías (Empty States):** Si no hay clientes, no mostramos un "No hay datos". Mostramos: *"Tu lista de clientes está más vacía que bidón de 20L en verano. ¡Hacé clic acá para cargar el primero!"*
*   **Micro-Tutoriales (30 sec):** Un ícono de cámara de video (🎥) al lado de botones complejos (ej: "Optimizar Ruta") que abre un video flotante rápido.
*   **Tooltips Proactivos:** La primera vez que el usuario ve la sección de "Envases en Calle", un globo le explica: *"Este número es tu capital. Representa todos los bidones que tus clientes tienen en su casa y todavía no te devolvieron."*

---

## 🛡️ 4. Salida Fácil y Soporte (La Red de Seguridad)
Si el usuario se frustra, no lo dejamos solo.

*   **Botón SOS WhatsApp:** Siempre visible abajo a la derecha: *"¿Te trabaste cargando datos? Tocá aquí y te ayudamos por chat ahora mismo."*
*   **Opción "Hacelo por mí":** Un banner que diga: *"¿Tenés muchos clientes en el cuaderno y te da pereza pasarlos? Sacales una foto y mandanosla por WhatsApp, nosotros los cargamos por vos."* (Key feature para captar clientes 'Legacy').
*   **Salto de Tutorial:** Permitir al usuario cerrar el onboarding en cualquier momento, pero dejar un botón de "Continuar guía" visible para cuando quiera retomar.

---

## 🛠️ Checklist de Implementación (Para Desarrolladores)
- [ ] Implementar `OnboardingProgress` component en el Dashboard.
- [ ] Crear el modal de bienvenida con los 3 pasos iniciales.
- [ ] Configurar alertas de "Sección completa" (Confetti effect suave).
- [ ] Integrar botón flotante de WhatsApp con mensaje pre-cargado indicando en qué paso del onboarding está el usuario.
