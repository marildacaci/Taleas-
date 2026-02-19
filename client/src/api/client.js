import { getAccessToken, getIdToken } from "../auth/authClient";

const RAW = import.meta.env.VITE_API_BASE || "http://localhost:5000";
export const API_BASE = RAW.replace(/\/+$/, "");

async function apiFetch(
  path,
  { auth = false, tokenType = "access", ...options } = {}
) {
  const headers = { ...(options.headers || {}) };

  if (auth) {
    const token =
      tokenType === "id" ? await getIdToken() : await getAccessToken();

    if (!token) {
      const err = new Error("Not authenticated");
      err.status = 401;
      throw err;
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
  data?.message ||
  data?.error?.message ||
  data?.error ||
  (res.status === 500 ? "Server error" : `HTTP ${res.status}`);

    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export const apiGet = (path, opts) =>
  apiFetch(path, { ...opts, method: "GET" });

export const apiPost = (path, body, opts) =>
  apiFetch(path, {
    ...opts,
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    body: JSON.stringify(body ?? {})
  });

export const apiPatch = (path, body, opts) =>
  apiFetch(path, {
    ...opts,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    body: JSON.stringify(body ?? {})
  });

export const apiDelete = (path, opts) =>
  apiFetch(path, { ...opts, method: "DELETE" });
