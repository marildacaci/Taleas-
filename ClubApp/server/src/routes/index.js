const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/clubs", require("./clubRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/plans", require("./planRoutes"));
router.use("/memberships", require("./membershipRoutes"));
router.use("/payments", require("./paymentRoutes"));

module.exports = router;
