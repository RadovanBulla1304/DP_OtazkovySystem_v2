const express = require("express");
const {
    createSubject,
    getAllSubjects,
    editSubject,
    deleteSubject
} = require("../controllers/subjectController");

const router = express.Router();

router.put("/:id", editSubject);
router.post("/", createSubject);
router.get("/", getAllSubjects);
router.delete("/:id", deleteSubject);

module.exports = router;
