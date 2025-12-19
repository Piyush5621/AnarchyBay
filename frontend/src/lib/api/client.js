import { LOCALSTORAGE_KEYS } from "../../utils/constants.js";

const { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } = LOCALSTORAGE_KEYS;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
if (!API_BASE_URL) {
  console.error(
    "❌ VITE_BACKEND_URL is not defined. Set it in Vercel Environment Variables."
  );
}


const storage = typeof window !== "undefined" ? window.localStorage : undefined;

export const getAccessToken = () => storage?.getItem(ACCESS_TOKEN_KEY) ?? null;

export const saveSessionTokens = (session) => {
  if (!storage || !session) return;
  const accessToken = session.access_token || session.accessToken;
  const refreshToken = session.refresh_token || session.refreshToken;
  if (accessToken) storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearSessionTokens = () => {
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(REFRESH_TOKEN_KEY);
};

const request = async (
  endpoint,
  method,
  body,
  options = {}
) => {
  const { headers = {}, requireAuth = true } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (response.status === 401 && requireAuth) {
    clearSessionTokens();
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage = typeof data?.error === 'object' 
      ? data?.error?.message || JSON.stringify(data.error)
      : data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

const api = {
  get: (endpoint, options) =>
    request(endpoint, "GET", undefined, options),

  post: (endpoint, body, options) =>
    request(endpoint, "POST", body, options),

  put: (endpoint, body, options) =>
    request(endpoint, "PUT", body, options),

  patch: (endpoint, body, options) =>
    request(endpoint, "PATCH", body, options),

  delete: (endpoint, options) =>
    request(endpoint, "DELETE", undefined, options),
};

export default api;