const express = require("express");
const {
  getAllUser,
  editUser,
  removeUser,
  createUser,
  createTeacher,
  getAllTeachers,
} = require("../controllers/adminController");


const router = express.Router();


router.get("/getAllTeachers", getAllTeachers);
router.get("/getAllUsers", getAllUser);
router.post("/teacher", createTeacher);
router.post("/user", createUser);
router.put("/user/:id", editUser);
router.delete("/user/:id", removeUser);

module.exports = router;
