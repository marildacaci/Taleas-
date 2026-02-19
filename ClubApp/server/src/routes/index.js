const express = require("express");
const router = express.Router();

router.use("/me", require("./meRoutes"));       

router.use("/clubs", require("./clubRoutes"));
router.use("/memberships", require("./membershipRoutes")); 
router.use("/uploads", require("./uploadRoutes"));
router.use("/catalog", require("./catalogRoutes"));

module.exports = router;
