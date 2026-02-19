import { apiGet } from "./client";

export async function getClubCatalog(type) {
  const t = type || "fitness";
  const res = await apiGet(`/api/catalog/clubs?type=${encodeURIComponent(t)}`);
  return res?.data || null;
}
