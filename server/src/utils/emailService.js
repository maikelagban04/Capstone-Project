import nodemailer from "nodemailer";
import { hasSendGridConfig, sendViaSendGrid } from "./sendgridMail.js";

export { hasSendGridConfig };

const getEnvValue = (key) => (process.env[key] || "").trim();

export const hasSmtpConfig = () =>
  Boolean(
    getEnvValue("SMTP_HOST") &&
      getEnvValue("SMTP_PORT") &&
      getEnvValue("SMTP_USER") &&
      getEnvValue("SMTP_PASS")
  );

const getMissingSmtpKeys = () => {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  return required.filter((key) => !getEnvValue(key));
};

let cachedTransporter = null;

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;
  if (cachedTransporter) return cachedTransporter;

  const port = Number(getEnvValue("SMTP_PORT"));
  const secure = getEnvValue("SMTP_SECURE") === "true" || port === 465;
  const debug = getEnvValue("SMTP_DEBUG") === "true";

  cachedTransporter = nodemailer.createTransport({
    host: getEnvValue("SMTP_HOST"),
    port,
    secure,
    auth: {
      user: getEnvValue("SMTP_USER"),
      pass: getEnvValue("SMTP_PASS").replace(/\s+/g, ""),
    },
    // Prevent hanging requests on restrictive hosts.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    ...(debug
      ? {
          logger: true,
          debug: true,
        }
      : {}),
  });

  return cachedTransporter;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCurrency = (value) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);

const sendEmail = async ({ to, subject, text, html }) => {
  if (hasSendGridConfig()) {
    return sendViaSendGrid({ to, subject, text, html });
  }

  const transporter = getTransporter();

  if (!transporter) {
    const missing = getMissingSmtpKeys();
    console.warn(
      `Email skipped: SendGrid not configured and SMTP is incomplete (${missing.join(", ")}).`
    );
    return;
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
  return info;
};

const sendSafely = (emailPromise) => {
  emailPromise.catch((error) => {
    const details = [
      error?.message,
      error?.code ? `code=${error.code}` : null,
      error?.response ? `response=${error.response}` : null,
    ]
      .filter(Boolean)
      .join(" ");
    console.error("Email delivery failed:", details || "Unknown error");
  });
};

export const sendWelcomeEmail = (user) => {
  if (!user?.email) {
    return;
  }

  const name = user.name || "there";

  sendSafely(
    sendEmail({
      to: user.email,
      subject: "Welcome to KyronTech",
      text: `Hi ${name}, welcome to KyronTech. Your account is ready.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h2>Welcome to KyronTech, ${escapeHtml(name)}!</h2>
          <p>Your account is ready. You can now browse products and place orders from your profile.</p>
          <p>Thanks for joining us.</p>
        </div>
      `,
    })
  );
};

export const sendOrderConfirmationEmail = (user, order) => {
  if (!user?.email || !order) {
    return;
  }

  const items = order.items || [];
  const itemLines = items
    .map((item) => `${item.quantity}x ${item.title} - ${formatCurrency(item.subtotal)}`)
    .join("\n");
  const htmlItems = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0;">${escapeHtml(item.title)}</td>
          <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px 0; text-align: right;">${formatCurrency(item.subtotal)}</td>
        </tr>
      `
    )
    .join("");

  sendSafely(
    sendEmail({
      to: user.email,
      subject: `Order confirmation #${order._id}`,
      text: `Hi ${user.name || "there"}, your order #${order._id} has been received.\n\n${itemLines}\n\nTotal: ${formatCurrency(
        order.totalAmount
      )}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h2>Order received</h2>
          <p>Hi ${escapeHtml(user.name || "there")}, we received your order <strong>#${order._id}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr>
                <th style="border-bottom: 1px solid #e5e7eb; padding: 8px 0; text-align: left;">Product</th>
                <th style="border-bottom: 1px solid #e5e7eb; padding: 8px 0; text-align: center;">Qty</th>
                <th style="border-bottom: 1px solid #e5e7eb; padding: 8px 0; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${htmlItems}</tbody>
          </table>
          <p style="font-size: 18px;"><strong>Total: ${formatCurrency(order.totalAmount)}</strong></p>
          <p>We will keep you updated when the order status changes.</p>
        </div>
      `,
    })
  );
};
