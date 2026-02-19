const nodemailer = require("nodemailer");

let transporter = null;

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",  
    auth: { user, pass }
  });
}

function getTransporter() {
  if (!transporter) transporter = buildTransporter();
  return transporter;
}

async function sendEmail({ from, to, cc, bcc, subject, html }) {
  const t = getTransporter();

  if (!t) {
    console.warn("[EMAIL] Missing SMTP env. Skipping:", subject);
    return;
  }

  if (!to && !cc && !bcc) return;

  await t.sendMail({
    from: from || process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    cc,
    bcc,
    subject,
    html
  });
}

module.exports = { sendEmail };
