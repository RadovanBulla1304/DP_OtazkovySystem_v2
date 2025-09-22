const express = require("express");
const {
    createQuestion,
    editQuestion,
    deleteQuestion,
    getAllQuestions,
    getQuestionById,
    getQuestionsByModuleId,
    getQuestionsBySubjectId,
    getQuestionsByUserId,
    validateQuestion,
    respondToValidation
} = require("../controllers/questionController");

const router = express.Router();


router.get("/subject/:subjectId", getQuestionsBySubjectId); // Get questions by subject ID
router.get("/module/:moduleId", getQuestionsByModuleId);    // Get questions by module ID
router.get("/user/:userId", getQuestionsByUserId);          // Get questions by user ID
router.get("/:id", getQuestionById);                        // Get a question by ID
router.get("/", getAllQuestions);                           // Get all questions
router.post("/", createQuestion);                           // Create a new question
router.put("/:id", editQuestion);                           // Edit a question by ID
router.delete("/:id", deleteQuestion);                      // Delete a question by ID

// Week 2 & 3 functionality
router.post("/:id/validate", validateQuestion);             // Validate a question (Week 2)
router.post("/:id/respond", respondToValidation);           // Respond to validation (Week 3)

module.exports = router;