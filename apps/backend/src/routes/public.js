const express = require("express");
const router = express.Router();
const { SignIn, Register, checkUiVersion } = require("../controllers/publicController");

router.post("/signin", SignIn);
router.post("/register", Register);

router.post("/activation/:email/:hash", (req, res) => {
  res.status(404).send();
});

router.get("/checkUiVersion/:version", checkUiVersion);
router.get("/checkUiVersion", checkUiVersion);

module.exports = router;
