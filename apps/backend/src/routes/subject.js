const express = require("express");
const {
    createSubject,
    getAllSubjects,
    editSubject,
    deleteSubject,
    getSubjectById,
    asignUserToSubject,
    unasignUserFromSubject,
    assignTeacherToSubject,
    unassignTeacherFromSubject,
    getTeacherSubjects,
    getAllSubjectsAssignedToUser,
    triggerYearlyUnassignment,
    triggerInactiveUserCleanup
} = require("../controllers/subjectController");

const router = express.Router();

router.put("/:id", editSubject);
router.post("/", createSubject);
router.get("/", getAllSubjects);
router.get("/assigned/:id", getAllSubjectsAssignedToUser);
router.get("/teacher/subjects", getTeacherSubjects);
router.get("/:id", getSubjectById);
router.post("/assign-user", asignUserToSubject);
router.post("/unassign-user", unasignUserFromSubject);
router.post("/assign-teacher", assignTeacherToSubject);
router.post("/unassign-teacher", unassignTeacherFromSubject);
router.post("/trigger-yearly-unassignment", triggerYearlyUnassignment);
router.post("/trigger-inactive-user-cleanup", triggerInactiveUserCleanup);
router.delete("/:id", deleteSubject);
module.exports = router;
