const express = require("express");
const {
    meTeacher,
} = require("../controllers/teacherController");

const router = express.Router();

router.get("/current", meTeacher);


// Pridanie užívateľa

module.exports = router;
