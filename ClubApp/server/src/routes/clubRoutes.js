const router = require("express").Router();
const Club = require("../models/Club");
const crud = require("../controllers/crudFactory");
const club = require("../controllers/clubController");

router.post("/", club.create);
router.get("/", crud.getAll(Club));
router.get("/:id", crud.getOne(Club, "Club"));

router.get("/:id/options", club.getOptions);
router.post("/:id/join", club.join);

router.put("/:id", crud.updateOne(Club, "club", "Club"));
router.delete("/:id", club.delete);

module.exports = router;
