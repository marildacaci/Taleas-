const express = require("express");
const router = express.Router();
const m = require("../controllers/membershipController");
const requireAuth = require("../middlewares/requireCognitoAuth");
const requireRole = require("../middlewares/requireRole");
console.log("[membershipRoutes] handlers:", {
  create: typeof m.create,
  getActive: typeof m.getActive,
  cancel: typeof m.cancel,
  listMy: typeof m.listMy,
  listByUser: typeof m.listByUser,
  runExpireJob: typeof m.runExpireJob,
  runReminderJob: typeof m.runReminderJob,
  requireAuth: typeof requireAuth,
  requireRole: typeof requireRole
});

router.post("/", requireAuth, m.create);
router.get("/active", requireAuth, m.getActive);
router.post("/cancel", requireAuth, m.cancel);

router.get("/my", requireAuth, m.listMy);

router.get("/user/:userId", requireAuth, requireRole("admin"), m.listByUser);
router.post("/jobs/expire", requireAuth, requireRole("admin"), m.runExpireJob);
router.post("/jobs/reminder", requireAuth, requireRole("admin"), m.runReminderJob);

module.exports = router;
