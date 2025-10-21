const express = require("express");
const {
    meTeacher,
    getAllUsersAssignedToSubject
} = require("../controllers/teacherController");

const router = express.Router();

router.get("/current", meTeacher);
router.get("/getAllUsersAssignedToSubject/:subjectId", getAllUsersAssignedToSubject);


// Pridanie užívateľa

module.exports = router;
