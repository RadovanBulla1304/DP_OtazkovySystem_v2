const express = require("express");
const {
  getAllUser,
  editUser,
  editTeacher,
  removeUser,
  createUser,
  createTeacher,
  getAllTeachers,
  removeTeacher,
} = require("../controllers/adminController");


const router = express.Router();


router.get("/getAllTeachers", getAllTeachers);
router.get("/getAllUsers", getAllUser);
router.post("/teacher", createTeacher);
router.post("/user", createUser);
router.put("/user/:id", editUser);
router.put("/teacher/:id", editTeacher);
router.delete("/user/:id", removeUser);
router.delete("/teacher/:id", removeTeacher);

module.exports = router;
