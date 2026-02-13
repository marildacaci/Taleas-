import { apiFetch } from "./http";

export function getActivitiesByClub(clubId, lang) {
  const q = clubId ? `?clubId=${encodeURIComponent(clubId)}` : "";
  return apiFetch(`/api/activities${q}`, { lang });
}

export function createActivity(payload, lang) {
  return apiFetch("/api/activities", {
    lang,
    method: "POST",
    body: payload,
  });
}
