const express = require("express");
const router = express.Router();

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const requireAuth = require("../middlewares/requireCognitoAuth");
const requireRole = require("../middlewares/requireRole");

const s3 = new S3Client({ region: process.env.AWS_REGION });

function safeExt(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

router.post("/presign", requireAuth, requireRole("admin"), async (req, res) => {
  const { contentType } = req.body || {};
  const ext = safeExt(contentType);

  if (!ext) {
    return res.status(400).json({ ok: false, error: "Only jpeg/png/webp allowed" });
  }

  const bucket = process.env.S3_UPLOAD_BUCKET;
  if (!bucket) {
    return res.status(500).json({ ok: false, error: "S3_UPLOAD_BUCKET missing" });
  }

  const key = `covers/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 }); 
  const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  res.json({ ok: true, data: { uploadUrl, publicUrl, key } });
});

module.exports = router;
