const express = require("express");
const {
    createQuestion,
    editQuestion,
    deleteQuestion,
    getAllQuestions,
    getQuestionById,
    getQuestionsByModuleId,
    getQuestionsBySubjectId
} = require("../controllers/questionController");

const router = express.Router();


router.get("/subject/:subjectId", getQuestionsBySubjectId); // Get questions by subject ID
router.get("/module/:moduleId", getQuestionsByModuleId);    // Get questions by module ID
router.get("/:id", getQuestionById);                        // Get a question by ID
router.get("/", getAllQuestions);                           // Get all questions
router.post("/", createQuestion);                           // Create a new question
router.put("/:id", editQuestion);                           // Edit a question by ID
router.delete("/:id", deleteQuestion);// Delete a question by ID

module.exports = router;