/**
 * Fallback de Suspense dentro del área principal: no tapa header ni navegación.
 */
function SectionLoadingFallback() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary-400/30 border-t-primary-400"
        aria-hidden
      />
      <p className="text-sm text-white/50">Cargando sección…</p>
    </div>
  );
}

export default SectionLoadingFallback;
