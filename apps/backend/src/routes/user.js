const express = require("express");
const {
  SignOut,
  getCurrentUser,
  changePassword,
  edit,
  addStudent,
  addEmployeeOrAdmin,
} = require("../controllers/userController");

const router = express.Router();

router.get("/current", getCurrentUser);
router.post("/signout", SignOut);
router.post("/change-password", changePassword);
router.put("/", edit);

// Pridanie užívateľa
router.post("/admin/addStudent", addStudent);
router.post("/admin/addEmployeeOrAdmin", addEmployeeOrAdmin);

module.exports = router;
