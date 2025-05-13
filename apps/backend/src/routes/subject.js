const express = require("express");
const {
    createSubject,
    getAllSubjects,
    editSubject
} = require("../controllers/subjectController");

const router = express.Router();

router.put("/:id", editSubject);
router.post("/", createSubject);
router.get("/", getAllSubjects);


module.exports = router;
