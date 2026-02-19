require("dotenv").config();
const mongoose = require("mongoose");
const Club = require("../models/Club");
const catalog = require("../catalog/clubCatalog");

function normalizePlans(plans) {
  if (!Array.isArray(plans)) return [];
  return plans.map((p) => ({
    name: String(p?.name || "").trim(),
    durationDays: Number(p?.durationDays),
    price: Number(p?.price),
    maxActivities: Number(p?.maxActivities)
  }));
}

function normalizeActivities(activities) {
  if (!Array.isArray(activities)) return [];
  return activities.map((x) => String(x || "").trim()).filter(Boolean);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const clubs = await Club.find({});
  let updated = 0;

  for (const c of clubs) {
    const tpl = catalog[c.type];
    if (!tpl) continue;

    const needsPlans = !Array.isArray(c.plans) || c.plans.length === 0 || c.plans.some(p => p.maxActivities == null);
    const needsActivities = !Array.isArray(c.activities) || c.activities.length === 0;

    if (!needsPlans && !needsActivities) continue;

    c.description = String(tpl.description || "").trim();
    c.plans = normalizePlans(tpl.plans);
    c.activities = normalizeActivities(tpl.activities);

    await c.save();
    updated++;
  }

  console.log("Updated clubs:", updated);
  await mongoose.disconnect();
})();
