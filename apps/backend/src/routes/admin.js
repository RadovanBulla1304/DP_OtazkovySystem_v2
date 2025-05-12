const express = require("express");
const {
  getAllUser,
  edit,
  remove,
  createUser,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/getAllUser", getAllUser);
router.post("/user", createUser);
router.put("/user/:id", edit);
router.delete("/user/:id", remove);

module.exports = router;
