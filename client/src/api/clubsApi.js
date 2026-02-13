import { apiFetch } from "./http";

export function getClubs(lang) {
  return apiFetch("/api/clubs", { lang });
}

export function getClubOptions(clubId, lang) {
  return apiFetch(`/api/clubs/${clubId}/options`, { lang });
}

export function joinClub(clubId, payload, lang) {
  return apiFetch(`/api/clubs/${clubId}/join`, { lang, method: "POST", body: payload });
}
