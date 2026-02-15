const Membership = require("../models/Membership");

async function runMigrations() {
  await Membership.updateMany(
    { expiringNotifiedAt: { $exists: false } },
    { $set: { expiringNotifiedAt: null } }
  );
}

module.exports = { runMigrations };
