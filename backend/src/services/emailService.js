import nodemailer from 'nodemailer';
const isConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM
);
const transport = isConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;
export async function sendEmail({ to, subject, text }) {
  if (!transport) return false;
  try {
    await transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
    return true;
  } catch {
    console.error('Email delivery failed. Check SMTP configuration.');
    return false;
  }
}
export const emailDeliveryConfigured = isConfigured;
