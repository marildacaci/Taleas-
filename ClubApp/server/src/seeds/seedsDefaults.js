require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const ClubType = require("../models/ClubType");
const MembershipPlan = require("../models/MembershipPlan");

const clubTypes = [
  { key: "fitness", name: "Fitness" },
  { key: "yoga", name: "Yoga" },
  { key: "football", name: "Football" },
  { key: "basketball", name: "Basketball" }
];

const membershipPlans = [
  { key: "basic_30", name: "Basic 1 Month", durationDays: 30, price: 25, currency: "EUR" },
  { key: "standard_90", name: "Standard 3 Months", durationDays: 90, price: 65, currency: "EUR" },
  { key: "pro_180", name: "Pro 6 Months", durationDays: 180, price: 110, currency: "EUR" },
  { key: "vip_365", name: "VIP 12 Months", durationDays: 365, price: 180, currency: "EUR" }
];

async function upsertMany(Model, items, uniqueKey = "key") {
  for (const item of items) {
    await Model.updateOne(
      { [uniqueKey]: item[uniqueKey] },
      { $set: item },
      { upsert: true }
    );
  }
}

(async () => {
  try {
    await connectDB();

    await upsertMany(ClubType, clubTypes, "key");
    await upsertMany(MembershipPlan, membershipPlans, "key");

    console.log("Seed completed: ClubTypes + MembershipPlans");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
})();
