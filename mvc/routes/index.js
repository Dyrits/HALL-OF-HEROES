var express = require('express');
var router = express.Router();
const ctrlIndex = require('../controllers/index');

router.get('/', ctrlIndex.getIndex);
router.get("/heroes", ctrlIndex.getHeroesIndex);
router.get("/create-hero", ctrlIndex.getHeroesForm);
router.post("/create-hero", ctrlIndex.createNewHero);
router.get("/update-hero/:id", ctrlIndex.getUpdateForm);
router.post("/update-hero/:id", ctrlIndex.updateHero);
router.post("/delete-hero/:id", ctrlIndex.deleteHero);
router.get("/reset", ctrlIndex.reset)
;
module.exports = router;
