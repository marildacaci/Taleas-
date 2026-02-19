const { jwtVerify, createRemoteJWKSet } = require("jose");
const { syncUserFromCognitoClaims } = require("../services/userSyncService");

const region = process.env.COGNITO_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

let issuer = null;
let jwks = null;

if (region && userPoolId) {
  issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
} else {
  console.warn(
    "[AUTH] Missing Cognito env vars (COGNITO_REGION/COGNITO_USER_POOL_ID)"
  );
}

function pickUsername(payload) {
  return (
    payload["cognito:username"] ||
    payload.username ||
    payload.preferred_username ||
    null
  );
}

function normalizeGroups(g) {
  if (!g) return [];
  if (Array.isArray(g)) return g;
  if (typeof g === "string" && g.trim()) return [g.trim()];
  return [];
}

async function requireCognitoAuth(req, res, next) {
  try {
    if (!issuer || !jwks || !clientId) {
      return res.status(500).json({
        ok: false,
        error: "AUTH_MISCONFIGURED",
        message: "Cognito auth is not configured on the server."
      });
    }

    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED",
        message: "Missing Bearer token"
      });
    }

    const { payload } = await jwtVerify(token, jwks, { issuer });

    if (payload.token_use !== "access") {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED",
        message: "Access token required"
      });
    }

    if (payload.client_id !== clientId) {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED",
        message: "Invalid client_id"
      });
    }

    const groups = normalizeGroups(payload["cognito:groups"]);

    req.auth = {
      sub: payload.sub,
      tokenUse: payload.token_use,
      email: payload.email || null,
      username: pickUsername(payload),
      groups,
      scope: payload.scope || null,

      _raw: payload
    };

    req.user = await syncUserFromCognitoClaims(req.auth);

    if (groups.includes("admin")) {
      req.user = req.user || {};
      req.user.role = "admin";
    }

    return next();
  } catch (e) {
    const name = e?.name || "";
    const code = e?.code || "";
    const expired =
      name.toLowerCase().includes("expired") ||
      String(code).toLowerCase().includes("expired");

    if (process.env.NODE_ENV !== "production") {
      console.error("[AUTH] verify failed:", name || code, e?.message || e);
    }

    return res.status(401).json({
      ok: false,
      error: "UNAUTHORIZED",
      message: expired ? "Token expired" : "Invalid/expired token"
    });
  }
}

module.exports = requireCognitoAuth;
