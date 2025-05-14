const express = require("express");
const {
  getAllUser,
  editUser,
  removeUser,
  createUser,
} = require("../controllers/adminController");

const router = express.Router();


router.get("/getAllUsers", getAllUser);
router.post("/user", createUser);
router.put("/user/:id", editUser);
router.delete("/user/:id", removeUser);

module.exports = router;
