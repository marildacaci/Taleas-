import { apiGet } from "./client";

export const fetchPublicClubs = () => apiGet("/api/clubs/public"); // no auth
export const fetchAdminClubs  = () => apiGet("/api/clubs", { auth: true });
