/**
 * Pantalla de carga
 * Muestra un spinner mientras la aplicación se inicializa
 */
function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Cargando aplicación...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;

