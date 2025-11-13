const express = require("express");
const router = express.Router();
const { SignIn, Register, RegisterTeacher, checkUiVersion, signinTeacher, ConfirmEmail } = require("../controllers/publicController");
// Teacher sign-in route

router.post("/signin", SignIn);
router.post("/signin-teacher", signinTeacher);
router.post("/register", Register);
router.post("/register-teacher", RegisterTeacher);
router.get("/confirm-email/:token", ConfirmEmail);
router.post("/activation/:email/:hash", (req, res) => {
  res.status(404).send();
});

router.get("/checkUiVersion/:version", checkUiVersion);
router.get("/checkUiVersion", checkUiVersion);

module.exports = router;
