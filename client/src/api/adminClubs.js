import { apiGet, apiPost, apiPatch, apiDelete } from "./client";

const AUTH = { auth: true, tokenType: "access" };

export function adminListClubs(params = {}) {
  const qs = new URLSearchParams();
  if (params.type) qs.set("type", params.type);
  if (params.q) qs.set("q", params.q);
  if (typeof params.isPublic === "boolean") qs.set("isPublic", String(params.isPublic));

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet(`/api/clubs${suffix}`, AUTH);
}

export function adminCreateClub(body) {
  return apiPost("/api/clubs", body, AUTH);
}

export function adminUpdateClub(id, body) {
  return apiPatch(`/api/clubs/${id}`, body, AUTH);
}

export function adminSetVisibility(id, isPublic) {
  return apiPatch(`/api/clubs/${id}/visibility`, { isPublic }, AUTH);
}

export function adminDeleteClub(id) {
  return apiDelete(`/api/clubs/${id}`, AUTH);
}
