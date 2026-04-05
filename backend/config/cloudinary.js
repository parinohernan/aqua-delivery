const cloudinary = require('cloudinary').v2;

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function cloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Sube un buffer de imagen a Cloudinary bajo carpeta productos/{codigoEmpresa}.
 * @returns {Promise<{ secure_url: string }>}
 */
function uploadBufferToCloudinary(buffer, codigoEmpresa) {
  const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'productos';
  const folderPath = `${baseFolder}/${codigoEmpresa}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderPath, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Comprobantes de gastos: carpeta gastos/{codigoEmpresa}.
 * @returns {Promise<{ secure_url: string }>}
 */
function uploadExpenseImageBufferToCloudinary(buffer, codigoEmpresa) {
  const folderPath = `gastos/${codigoEmpresa}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderPath, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

configure();

module.exports = {
  cloudinary,
  configure,
  cloudinaryConfigured,
  uploadBufferToCloudinary,
  uploadExpenseImageBufferToCloudinary,
};
