const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { query, transaction } = require('../config/database');

const router = express.Router();

const CODE_PHRASE =
  process.env.STARTNOW_CODE_PHRASE || 'Crea tu empresa ahora';
const TRIAL_PLAN = 'prueba';
const TRIAL_DAYS = 15;
const PENDING_TTL_HOURS = 24;

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
});

const confirmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
});

const previewCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
});

function normalizeRazonSocial(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Código de 8 caracteres (A–Z y 0–9) a partir de razón social + frase HMAC */
function verificationCode(razonSocial) {
  const normalized = normalizeRazonSocial(razonSocial);
  const h = crypto
    .createHmac('sha256', CODE_PHRASE)
    .update(normalized, 'utf8')
    .digest();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += alphabet[h[i] % 36];
  }
  return out;
}

function normalizeCodeInput(code) {
  return String(code || '')
    .replace(/\s/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

function codesEqual(expected, entered) {
  const a = Buffer.from(expected, 'utf8');
  const norm = normalizeCodeInput(entered);
  if (norm.length !== 8) {
    return false;
  }
  const b = Buffer.from(norm, 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const e = email.trim();
  if (e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || pass === undefined) {
    return null;
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendVerificationEmail(to, code, razonSocial) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = getSmtpTransporter();

  if (!transporter) {
    console.log(
      `[startnow] SMTP no configurado — código (${razonSocial}): ${code} — usar WhatsApp o /getcode`
    );
    return { skipped: true, emailSent: false };
  }

  await transporter.sendMail({
    from,
    to,
    subject: 'Tu código para crear tu empresa — AquaDelivery',
    text: `Hola,\n\nTu código de verificación (8 letras y números) es: ${code}\n\nEs válido por ${PENDING_TTL_HOURS} horas. Cuando lo ingreses en la web, se creará la empresa "${razonSocial}" y tendrás ${TRIAL_DAYS} días de prueba gratuita.\n\nSi no pediste esto, ignorá este mensaje.\n`,
    html: `<p>Hola,</p><p>Tu código de verificación (8 letras y números) es: <strong style="font-size:1.25em;letter-spacing:0.1em">${code}</strong></p><p>Es válido por ${PENDING_TTL_HOURS} horas. Al ingresarlo en la web se creará la empresa <strong>${escapeHtml(
      razonSocial
    )}</strong> con <strong>${TRIAL_DAYS} días de prueba gratuita</strong>.</p><p>Si no pediste esto, ignorá este mensaje.</p>`,
  });
  return { skipped: false, emailSent: true };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

router.post('/request', requestLimiter, async (req, res) => {
  try {
    const {
      email,
      razonSocial,
      telegramId,
      nombre,
      apellido,
      usaEntregaProgramada,
      usaRepartoPorZona,
      husoHorario,
    } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const rs = normalizeRazonSocial(razonSocial);
    if (rs.length < 2 || rs.length > 100) {
      return res
        .status(400)
        .json({ error: 'Razón social debe tener entre 2 y 100 caracteres' });
    }

    const tg = String(telegramId || '').trim();
    if (tg.length < 1 || tg.length > 50) {
      return res.status(400).json({ error: 'ID de Telegram inválido' });
    }

    const nom = String(nombre || '').trim();
    const ape = String(apellido || '').trim();
    if (nom.length < 1 || nom.length > 50 || ape.length < 1 || ape.length > 50) {
      return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
    }

    const uep = usaEntregaProgramada ? 1 : 0;
    const urz = usaRepartoPorZona ? 1 : 0;
    let hus = parseInt(husoHorario, 10);
    if (Number.isNaN(hus)) hus = 0;
    hus = Math.max(-12, Math.min(14, hus));

    const emailNorm = email.trim().toLowerCase();
    const code = verificationCode(rs);
    const waDigits =
      (process.env.STARTNOW_WHATSAPP_NUMBER || '5492924406159').replace(
        /\D/g,
        ''
      );
    const waText = encodeURIComponent(
      `Hola, pedí crear mi empresa en AquaDelivery. Mi razón social es: ${rs}`
    );
    const whatsappUrl = `https://wa.me/${waDigits}?text=${waText}`;

    await query(
      `INSERT INTO startnow_pending (
        email, razon_social, telegram_id, nombre, apellido,
        usa_entrega_programada, usa_reparto_por_zona, huso_horario,
        created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? HOUR))
      ON DUPLICATE KEY UPDATE
        razon_social = VALUES(razon_social),
        telegram_id = VALUES(telegram_id),
        nombre = VALUES(nombre),
        apellido = VALUES(apellido),
        usa_entrega_programada = VALUES(usa_entrega_programada),
        usa_reparto_por_zona = VALUES(usa_reparto_por_zona),
        huso_horario = VALUES(huso_horario),
        created_at = NOW(),
        expires_at = DATE_ADD(NOW(), INTERVAL ? HOUR)`,
      [
        emailNorm,
        rs,
        tg,
        nom,
        ape,
        uep,
        urz,
        hus,
        PENDING_TTL_HOURS,
        PENDING_TTL_HOURS,
      ]
    );

    try {
      const mailResult = await sendVerificationEmail(emailNorm, code, rs);
      res.json({
        ok: true,
        emailSent: Boolean(mailResult.emailSent),
        whatsappUrl,
        message: mailResult.emailSent
          ? 'Te enviamos el código por email. También podés pedirlo por WhatsApp si lo necesitás.'
          : 'Pedí tu código por WhatsApp (o usá el mismo nombre de empresa en la página interna de código). Cuando tengas el código de 8 caracteres, ingresalo abajo.',
        ...(mailResult.skipped
          ? {
              devNote:
                'Sin SMTP el código se registra en el log del servidor; en producción configurá SMTP o usá WhatsApp.',
            }
          : {}),
      });
    } catch (mailErr) {
      console.error('[startnow] Error enviando email:', mailErr);
      return res.status(500).json({
        error: 'No pudimos enviar el correo. Pedí el código por WhatsApp o probá de nuevo.',
        whatsappUrl,
      });
    }
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error(
        '[startnow] Falta tabla startnow_pending — ejecutá: npm run migrate:startnow (en /backend)'
      );
      return res.status(503).json({
        error:
          'Falta configurar la base de datos para altas nuevas. Si sos quien administra el servidor, ejecutá en la carpeta backend: npm run migrate:startnow',
      });
    }
    console.error('[startnow] request:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.post('/confirm', confirmLimiter, async (req, res) => {
  try {
    const { email, codigo } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    const emailNorm = email.trim().toLowerCase();

    const rows = await query(
      `SELECT * FROM startnow_pending WHERE email = ? AND expires_at > NOW()`,
      [emailNorm]
    );

    if (!rows.length) {
      return res.status(400).json({
        error: 'No hay solicitud pendiente o el código venció. Pedí un código nuevo.',
      });
    }

    const row = rows[0];
    const expected = verificationCode(row.razon_social);
    if (!codesEqual(expected, codigo)) {
      return res.status(400).json({ error: 'Código incorrecto' });
    }

    const result = await transaction(async (tq) => {
      const empRes = await tq(
        `INSERT INTO empresa (
          razonSocial, fechaAlta, fechaVencimiento, plan,
          usaEntregaProgramada, usaRepartoPorZona, husoHorario
        ) VALUES (?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?, ?)`,
        [
          row.razon_social,
          TRIAL_DAYS,
          TRIAL_PLAN,
          row.usa_entrega_programada,
          row.usa_reparto_por_zona,
          row.huso_horario,
        ]
      );

      const codigoEmpresa = empRes.insertId;

      await tq(
        `INSERT INTO vendedores (codigoEmpresa, telegramId, nombre, apellido, zona)
         VALUES (?, ?, ?, ?, NULL)`,
        [
          codigoEmpresa,
          row.telegram_id,
          row.nombre,
          row.apellido,
        ]
      );

      const telegramAuditor = `auditor${codigoEmpresa}`;
      await tq(
        `INSERT INTO vendedores (codigoEmpresa, telegramId, nombre, apellido, zona)
         VALUES (?, ?, 'Auditor', 'Sistema', NULL)`,
        [codigoEmpresa, telegramAuditor]
      );

      await tq(
        `INSERT INTO tiposdepago (codigoEmpresa, pago, aplicaSaldo) VALUES (?, ?, ?), (?, ?, ?)`,
        [codigoEmpresa, 'Contado', 0, codigoEmpresa, 'Cta cte', 1]
      );

      await tq(`DELETE FROM startnow_pending WHERE email = ?`, [emailNorm]);

      const fechas = await tq(
        `SELECT fechaAlta, fechaVencimiento FROM empresa WHERE codigo = ?`,
        [codigoEmpresa]
      );

      return { codigoEmpresa, empresa: fechas[0] };
    });

    res.json({
      ok: true,
      codigoEmpresa: result.codigoEmpresa,
      fechaAlta: result.empresa.fechaAlta,
      fechaVencimiento: result.empresa.fechaVencimiento,
      mensaje: `Tu cuenta tiene prueba gratuita de ${TRIAL_DAYS} días hasta ${result.empresa.fechaVencimiento}.`,
    });
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({
        error:
          'Falta la tabla startnow_pending. En el servidor backend: npm run migrate:startnow',
      });
    }
    console.error('[startnow] confirm:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

/** Página oculta /getcode: mismo algoritmo que el envío (solo uso interno) */
router.post('/preview-code', previewCodeLimiter, (req, res) => {
  try {
    const { razonSocial } = req.body || {};
    const rs = normalizeRazonSocial(razonSocial);
    if (rs.length < 2 || rs.length > 100) {
      return res
        .status(400)
        .json({ error: 'Razón social debe tener entre 2 y 100 caracteres' });
    }
    const codigo = verificationCode(rs);
    res.json({ ok: true, codigo });
  } catch (error) {
    console.error('[startnow] preview-code:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
