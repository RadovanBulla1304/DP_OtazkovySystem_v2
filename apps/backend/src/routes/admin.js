const express = require("express");
const {
  getAllUser,
  editUser,
  removeUser,
  createUser,
  createSubject,
  getAllSubjects,
  editSubject
} = require("../controllers/adminController");

const router = express.Router();

router.put("/subject/:id", editSubject);
router.post("/subject", createSubject);
router.get("/getAllSubjects", getAllSubjects);
router.get("/getAllUsers", getAllUser);
router.post("/user", createUser);
router.put("/user/:id", editUser);
router.delete("/user/:id", removeUser);

module.exports = router;
