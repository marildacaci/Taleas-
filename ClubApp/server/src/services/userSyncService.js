const User = require("../models/User");

function normString(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function normEmail(v) {
  const s = normString(v);
  return s ? s.toLowerCase() : null;
}

function normalizeGroups(g) {
  if (!g) return [];
  if (Array.isArray(g)) return g;
  if (typeof g === "string" && g.trim()) return [g.trim()];
  return [];
}

function getGroupsFromClaims(claims) {
    return normalizeGroups(claims?.["cognito:groups"] || claims?.groups);
}

function deriveRoleFromGroups(groups) {
  return groups.includes("admin") ? "admin" : "user";
}

async function syncUserFromCognitoClaims(claims) {
  const sub = normString(claims?.sub);
  if (!sub) throw new Error("Missing Cognito sub");

  const groups = getGroupsFromClaims(claims);
  const role = deriveRoleFromGroups(groups);

  const email = normEmail(claims?.email);
  const username = normString(claims?.username || claims?.["cognito:username"]);

  const $set = { role };
  if (email) $set.email = email;
  if (username) $set.username = username;

  try {
    const updated = await User.findOneAndUpdate(
      { cognitoSub: sub },
      {
        $set,
        $setOnInsert: { cognitoSub: sub }
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return updated;
  } catch (err) {
    if (err?.code === 11000) {
      const doc = await User.findOne({ cognitoSub: sub }).lean();
      if (doc) return doc;
    }
    throw err;
  }
}

module.exports = { syncUserFromCognitoClaims };
