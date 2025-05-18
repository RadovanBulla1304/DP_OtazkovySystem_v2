const express = require("express");
const {
    createSubject,
    getAllSubjects,
    editSubject,
    deleteSubject,
    getSubjectById,
    asignUserToSubject,
    unasignUserFromSubject
} = require("../controllers/subjectController");

const router = express.Router();

router.put("/:id", editSubject);
router.post("/", createSubject);
router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.post("/assign-user", asignUserToSubject);
router.post("/unassign-user", unasignUserFromSubject);
router.delete("/:id", deleteSubject);
module.exports = router;
