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

/** Lado largo máximo en px (comprobantes legibles sin peso de foto de galería). */
const RECEIPT_IMAGE_MAX_EDGE = 1920;
/** Calidad JPEG al re-encodear (0–1). */
const RECEIPT_JPEG_QUALITY = 0.72;

async function compressRasterImageToJpegBase64(
  file: File,
  maxEdge: number,
  quality: number
): Promise<string> {
  let bitmap: ImageBitmap | undefined;
  let objectUrl: string | undefined;

  try {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          createImageBitmap(img)
            .then((b) => {
              bitmap = b;
              resolve();
            })
            .catch(reject);
        };
        img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
        img.src = objectUrl!;
      });
    }

    if (!bitmap) throw new Error('Sin bitmap');

    let w = bitmap.width;
    let h = bitmap.height;
    const scale = Math.min(1, maxEdge / Math.max(w, h));
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D no disponible');
    ctx.drawImage(bitmap, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return dataUrl.split(',')[1]!;
  } finally {
    bitmap?.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Prepara un adjunto de gasto: las imágenes se redimensionan y pasan a JPEG para reducir tamaño;
 * PDF y otros tipos se envían sin cambios.
 */
export async function prepareExpenseDocumentUpload(file: File): Promise<{
  file_name: string;
  file_type: string;
  base64: string;
}> {
  const isRasterImage =
    file.type.startsWith('image/') && file.type !== 'image/svg+xml';

  if (!isRasterImage) {
    return {
      file_name: file.name,
      file_type: file.type,
      base64: await fileToBase64(file),
    };
  }

  try {
    const base64 = await compressRasterImageToJpegBase64(
      file,
      RECEIPT_IMAGE_MAX_EDGE,
      RECEIPT_JPEG_QUALITY
    );
    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'comprobante';
    return {
      file_name: `${baseName}.jpg`,
      file_type: 'image/jpeg',
      base64,
    };
  } catch {
    return {
      file_name: file.name,
      file_type: file.type,
      base64: await fileToBase64(file),
    };
  }
}

/**
 * Imagen lista para subir por multipart (Cloudinary): JPEG comprimido como en prepareExpenseDocumentUpload.
 */
export async function prepareImageFileForExpenseUpload(file: File): Promise<File> {
  const isRasterImage =
    file.type.startsWith('image/') && file.type !== 'image/svg+xml';

  if (!isRasterImage) {
    return file;
  }

  try {
    const base64 = await compressRasterImageToJpegBase64(
      file,
      RECEIPT_IMAGE_MAX_EDGE,
      RECEIPT_JPEG_QUALITY
    );
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'comprobante';
    return new File([bytes], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

/**
 * Genera una URL local para previsualización
 */
export const getFilePreview = (file: File): string => {
  return URL.createObjectURL(file);
};
