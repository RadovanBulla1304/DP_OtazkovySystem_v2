const express = require("express");
const {
  SignOut,
  getCurrentUser,
  changePassword,
  getUserById,
  edit,
  addStudent,
  addEmployeeOrAdmin,
} = require("../controllers/userController");

const router = express.Router();

router.get("/current", getCurrentUser);
router.get("/:id", getUserById);
router.post("/signout", SignOut);
router.put("/", edit);

// Pridanie užívateľa

module.exports = router;
