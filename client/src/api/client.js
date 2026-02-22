import { getAccessToken, getIdToken } from "../auth/authClient";

const RAW = import.meta.env.VITE_API_BASE || "http://localhost:5000";
export const API_BASE = RAW.replace(/\/+$/, "");

async function readResponse(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text().catch(() => "");
  if (ct.includes("application/json")) {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }
  // fallback: try parse json anyway
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

async function apiFetch(path, { auth = false, tokenType = "access", ...options } = {}) {
  const headers = { ...(options.headers || {}) };

  if (auth) {
    const token = tokenType === "id" ? await getIdToken() : await getAccessToken();
    if (!token) {
      const err = new Error("Not authenticated");
      err.status = 401;
      throw err;
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const data = await readResponse(res);

  if (!res.ok) {
    // normalize message
    const message =
      (typeof data === "object" && data
        ? data?.message || data?.error?.message || data?.error
        : null) ||
      (res.status === 500 ? "Server error" : `HTTP ${res.status}`);

    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export const apiGet = (path, opts) => apiFetch(path, { ...opts, method: "GET" });

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

export const apiDelete = (path, opts) => apiFetch(path, { ...opts, method: "DELETE" });
