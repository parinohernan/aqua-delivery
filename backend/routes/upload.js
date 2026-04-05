const express = require('express');
const multer = require('multer');
const { verifyToken } = require('./auth');
const {
  cloudinaryConfigured,
  uploadBufferToCloudinary,
  uploadExpenseImageBufferToCloudinary,
} = require('../config/cloudinary');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
});

router.post('/product-image', verifyToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'La imagen no debe superar 5 MB' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'Archivo no válido' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!cloudinaryConfigured()) {
      return res.status(503).json({
        error: 'Subida de imágenes no configurada. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.',
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, req.user.codigoEmpresa);
    res.json({ imageURL: result.secure_url });
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error);
    res.status(500).json({
      error: error.message || 'Error al subir la imagen',
    });
  }
});

router.post('/expense-image', verifyToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'La imagen no debe superar 5 MB' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'Archivo no válido' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!cloudinaryConfigured()) {
      return res.status(503).json({
        error: 'Subida de imágenes no configurada. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.',
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    const result = await uploadExpenseImageBufferToCloudinary(req.file.buffer, req.user.codigoEmpresa);
    res.json({ imageURL: result.secure_url });
  } catch (error) {
    console.error('Error subiendo comprobante a Cloudinary:', error);
    res.status(500).json({
      error: error.message || 'Error al subir la imagen',
    });
  }
});

module.exports = router;
