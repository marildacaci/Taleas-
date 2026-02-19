import { API_BASE } from "./http";
import { getAccessToken } from "../auth/authClient";

export async function updateMyProfile(payload) {
  const token = await getAccessToken();
  if (!token) throw new Error("No token");

  const res = await fetch(`${API_BASE}/api/me/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Profile update failed");
  return data;
}
