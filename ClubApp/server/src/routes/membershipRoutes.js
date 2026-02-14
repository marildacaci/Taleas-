const express = require("express");
const router = express.Router();
const m = require("../controllers/membershipController");
const requireAuth = require("../middlewares/requireAuth");
const requireRole = require("../middlewares/requireRole");

router.post("/", requireAuth, m.create);
router.post("/cancel", requireAuth, m.cancel);

router.get("/user/:userId", requireRole("admin"), m.listByUser);

router.get("/active", requireAuth, m.getActive);

router.post("/jobs/expire", requireRole("admin"), m.runExpireJob);
router.post("/jobs/reminder", requireRole("admin"), m.runReminderJob);

module.exports = router;
