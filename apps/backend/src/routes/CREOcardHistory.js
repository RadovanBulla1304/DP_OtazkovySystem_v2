const express = require("express");
const {
  addCREOcardHistory,
  getCREOcardHistory,
} = require("../controllers/CREOcardHistoryController");

const router = express.Router();

router.post("/addCREOcardHistory", addCREOcardHistory); // Pridanie histórie
router.get("/getCREOcardHistory/:personalNumber", getCREOcardHistory); // Získanie histórie podľa personalNumber

module.exports = router;
