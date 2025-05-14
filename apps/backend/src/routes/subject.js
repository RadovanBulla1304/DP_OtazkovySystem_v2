const express = require("express");
const {
    createSubject,
    getAllSubjects,
    editSubject,
    deleteSubject,
    getSubjectById
} = require("../controllers/subjectController");

const router = express.Router();

router.put("/:id", editSubject);
router.post("/", createSubject);
router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.delete("/:id", deleteSubject);

module.exports = router;
