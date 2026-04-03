/**
 * Convierte un archivo File a una cadena Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Quitamos el prefijo 'data:image/jpeg;base64,'
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Genera una URL local para previsualización
 */
export const getFilePreview = (file: File): string => {
  return URL.createObjectURL(file);
};
