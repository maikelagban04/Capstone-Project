const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const normalizeApiUrl = (url) => {
  const trimmed = url.trim().replace(/\/+$|^\s+|\s+$/g, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const API_URL = normalizeApiUrl(rawApiUrl);

export const apiRequest = async (endpoint, options = {}) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch (networkError) {
    throw new Error(
      `Network error: ${networkError?.message || "Failed to reach API"}`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      (typeof data === "object" && data && data.message) ||
      (typeof data === "string" && data.trim()) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
};

export { API_URL };
