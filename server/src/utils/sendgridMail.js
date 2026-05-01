const getEnvValue = (key) => (process.env[key] || "").trim();

export const hasSendGridConfig = () => Boolean(getEnvValue("SENDGRID_API_KEY"));

const unwrapQuoted = (value) => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
};

const parseFromHeader = (value) => {
  const trimmed = unwrapQuoted(value).trim();
  if (!trimmed) return null;

  const bracketMatch = trimmed.match(/^(.*?)\s*<([^>]+)>$/);
  if (bracketMatch) {
    const name = bracketMatch[1].replace(/^"|"$/g, "").trim();
    const email = bracketMatch[2].trim();
    return name ? { email, name } : { email };
  }

  return { email: trimmed };
};

export const getMailFrom = () => {
  const raw =
    getEnvValue("SENDGRID_FROM") ||
    getEnvValue("SMTP_FROM") ||
    getEnvValue("SMTP_USER") ||
    "";

  return parseFromHeader(raw);
};

export const sendViaSendGrid = async ({ to, subject, text, html }) => {
  const apiKey = getEnvValue("SENDGRID_API_KEY");
  if (!apiKey) {
    throw new Error("SendGrid API key is missing");
  }

  const from = getMailFrom();
  if (!from?.email) {
    throw new Error("Missing SENDGRID_FROM (or SMTP_FROM/SMTP_USER) for From address");
  }

  const controller = new AbortController();
  const timeoutMs = 15_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from,
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html },
        ],
      }),
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`SendGrid error ${response.status}: ${errorBody}`);
  }

  return response;
};
