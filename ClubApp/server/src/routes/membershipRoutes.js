const router = require("express").Router();
const Membership = require("../models/Membership");
const crud = require("../controllers/crudFactory");
const membership = require("../controllers/membershipController");

router.post("/", membership.create);
router.get("/", crud.getAll(Membership));
router.get("/:id", crud.getOne(Membership, "Membership"));
router.put("/:id", crud.updateOne(Membership, "membership", "Membership"));
router.delete("/:id", crud.deleteOne(Membership, "membership", "Membership"));

module.exports = router;
