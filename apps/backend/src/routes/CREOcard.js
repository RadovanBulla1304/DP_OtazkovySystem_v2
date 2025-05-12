const express = require("express");
const {
  addCREOcard,
  getCREOcards,
} = require("../controllers/CREOcardController");

const router = express.Router();

router.post("/admin/addCREOcard", addCREOcard); // Pridanie novej CREO karty
router.get("/admin/getCREOcards", getCREOcards); // Získanie všetkých CREO kariet

module.exports = router;
