const express = require("express");
const {
    createQuestion,
    editQuestion,
    deleteQuestion,
    getAllQuestions,
    getQuestionById,
    getQuestionsByModuleId,
    getQuestionsBySubjectId,
    getQuestionByUserId,
    validateQuestion,
    respondToValidation,
    getValidatedQuestionsWithAgreementBySubject,
    teacherValidateQuestion
} = require("../controllers/questionController");

const {
    getOrCreateAssignments,
    getAssignmentStats
} = require("../controllers/questionAssignmentController");

const router = express.Router();


router.get("/subject/:subjectId", getQuestionsBySubjectId); // Get questions by subject ID
router.get("/subject/:subjectId/validated-with-agreement", getValidatedQuestionsWithAgreementBySubject); // Get validated questions with user agreement
router.get("/module/:moduleId", getQuestionsByModuleId);    // Get questions by module ID
router.get("/user/:userId", getQuestionByUserId);          // Get questions by user ID
router.get("/:id", getQuestionById);                        // Get a question by ID
router.get("/", getAllQuestions);                           // Get all questions
router.post("/", createQuestion);                           // Create a new question
router.put("/:id", editQuestion);                           // Edit a question by ID
router.delete("/:id", deleteQuestion);                      // Delete a question by ID

// Week 2 & 3 functionality
router.post("/:id/validate", validateQuestion);             // Validate a question (Week 2)
router.post("/:id/respond", respondToValidation);           // Respond to validation (Week 3)
router.post("/:id/teacher-validate", teacherValidateQuestion); // Teacher validate a question

// Question assignments for Week 2
router.get("/assignments/:userId/:modulId", getOrCreateAssignments); // Get or create assignments for user
router.get("/assignments/stats/:modulId", getAssignmentStats);       // Get assignment statistics

module.exports = router;