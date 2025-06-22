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
router.post("/change-password", changePassword);
router.put("/", edit);

// Pridanie užívateľa
router.post("/admin/addStudent", addStudent);
router.post("/admin/addEmployeeOrAdmin", addEmployeeOrAdmin);

module.exports = router;
