import { apiPost, apiGet } from "./client";

export async function joinClub({ clubId, planId, selectedActivities }) {
  return apiPost(
    "/api/memberships",
    { clubId, planId, selectedActivities },
    { auth: true, tokenType: "id" }
  );
}

export async function getMyActiveMembership(clubId) {
  return apiGet(`/api/memberships/active?clubId=${encodeURIComponent(clubId)}`, {
    auth: true,
    tokenType: "id"
  });
}
