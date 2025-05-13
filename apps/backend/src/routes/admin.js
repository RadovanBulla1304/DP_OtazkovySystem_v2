const express = require("express");
const {
  getAllUser,
  edit,
  remove,
  createUser,
  createSubject,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/createSubject", createSubject);
router.get("/getAllUsers", getAllUser);
router.post("/user", createUser);
router.put("/user/:id", edit);
router.delete("/user/:id", remove);

module.exports = router;
