import nodemailer from "nodemailer";

const getEnvValue = (key) => (process.env[key] || "").trim();

const hasSmtpConfig = () =>
  Boolean(getEnvValue("SMTP_HOST") && getEnvValue("SMTP_PORT") && getEnvValue("SMTP_USER") && getEnvValue("SMTP_PASS"));

const getTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: getEnvValue("SMTP_HOST"),
    port: Number(getEnvValue("SMTP_PORT")),
    secure: getEnvValue("SMTP_SECURE") === "true" || Number(getEnvValue("SMTP_PORT")) === 465,
    auth: {
      user: getEnvValue("SMTP_USER"),
      pass: getEnvValue("SMTP_PASS"),
    },
  });
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
  const transporter = getTransporter();

  if (!transporter) {
    console.warn("Email skipped: SMTP configuration is missing.");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

const sendSafely = (emailPromise) => {
  emailPromise.catch((error) => {
    console.error("Email delivery failed:", error.message);
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
