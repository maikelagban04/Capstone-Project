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

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export { API_URL };
