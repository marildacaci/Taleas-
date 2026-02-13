const Membership = require("../models/Membership");
const Member = require("../models/Member");
const Club = require("../models/Club");
const {
  notifyMembershipExpiryReminder,
  notifyMembershipExpired
} = require("../services/notificationService");

async function runMembershipNotifications() {
  try {
    const now = new Date();

    const in3days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const toRemind = await Membership.find({
      status: "active",
      endDate: { $gte: now, $lte: in3days },
      reminderSentAt: null
    }).lean();

    for (const ms of toRemind) {
      const [member, club] = await Promise.all([
        Member.findById(ms.memberId).lean(),
        Club.findById(ms.clubId).lean()
      ]);

      await notifyMembershipExpiryReminder({
        member,
        clubName: club?.name || "Club",
        membership: ms
      });

      await Membership.findByIdAndUpdate(ms._id, { reminderSentAt: new Date() });
    }

    if (toRemind.length) {
      console.log(`[JOB] Sent ${toRemind.length} membership reminders.`);
    }

    const toExpire = await Membership.find({
      status: "active",
      endDate: { $lt: now }
    }).lean();

    for (const ms of toExpire) {
      await Membership.findByIdAndUpdate(ms._id, { status: "expired" });

      const [member, club] = await Promise.all([
        Member.findById(ms.memberId).lean(),
        Club.findById(ms.clubId).lean()
      ]);

      await notifyMembershipExpired({
        member,
        clubName: club?.name || "Club",
        membership: ms
      });
    }

    if (toExpire.length) {
      console.log(`[JOB] Expired ${toExpire.length} memberships + sent emails.`);
    } else if (!toRemind.length) {
      console.log("[JOB] No membership reminders/expiries.");
    }
  } catch (err) {
    console.error("[JOB ERROR]", err);
  }
}

module.exports = function startMembershipExpiryJob() {
  console.log("[JOB] Membership expiry job started.");
  runMembershipNotifications();
  setInterval(runMembershipNotifications, 10 * 60 * 1000);
};
