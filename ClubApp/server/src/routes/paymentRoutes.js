const express = require("express");
const router = express.Router();
const pay = require("../controllers/paymentController");
const requireAuth = require("../middlewares/requireAuth");
const requireRole = require("../middlewares/requireRole");
const requireSelfOrAdmin = require("../middlewares/requireSelfOrAdmin");


router.post("/intent-record", requireAuth, pay.createIntentRecord);

router.post("/confirm-paid", requireRole("admin"), pay.confirmPaid);

router.get("/user/:userId", requireAuth, requireSelfOrAdmin("userId"), pay.listByUser );

router.post("/failed", requireRole("admin"), pay.markFailed);
router.post("/cancel", requireRole("admin"), pay.cancel);

module.exports = router;
