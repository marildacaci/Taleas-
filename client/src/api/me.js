import { apiGet, apiPatch } from "./client";

export async function fetchMe() {
  return apiGet("/api/me", { auth: true, tokenType: "access" });
}

export async function updateMyProfile(payload) {
  return apiPatch("/api/me", payload, { auth: true, tokenType: "access" });
}
