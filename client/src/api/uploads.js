import { apiPost } from "./client";

export async function getPresignedCoverUrl(file) {
  const res = await apiPost(
    "/api/uploads/presign",
    { contentType: file.type },
    { auth: true, tokenType: "access" }
  );
  return res.data;
}

export async function uploadToS3(uploadUrl, file) {
  const r = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });
  if (!r.ok) throw new Error(`S3 upload failed (HTTP ${r.status})`);
}
