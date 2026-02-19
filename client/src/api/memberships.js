import { apiPost, apiGet } from "./client";

export async function joinClub({ clubId, planName, activities }) {
  return apiPost(
    "/api/memberships",
    { clubId, planName, activities },
    { auth: true, tokenType: "access" }
  );
}

export async function getMyActiveMembership() {
  return apiGet("/api/memberships/me/active", { auth: true, tokenType: "access" });
}
