const membershipService = require("../services/membershipService");

function safeRun(name, fn) {
  fn().catch((e) => console.error(`[JOB] ${name} failed:`, e?.message || e));
}

function startMembershipJobs() {
  safeRun("expireMembershipsJob (startup)", () => membershipService.expireMembershipsJob());

  setInterval(() => {
    safeRun("expireMembershipsJob", () => membershipService.expireMembershipsJob());
  }, 60 * 60 * 1000);


  safeRun("membershipExpiryReminderJob (startup)", () => membershipService.membershipExpiryReminderJob(3));

  setInterval(() => {
    safeRun("membershipExpiryReminderJob", () => membershipService.membershipExpiryReminderJob(3));
  }, 24 * 60 * 60 * 1000);

  console.log("[JOB] Membership jobs started.");
}

module.exports = { startMembershipJobs };
