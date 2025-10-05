const express = require("express");
const {
    getValidatedQuestionsForTest,
    getValidatedQuestionsByModules,
    addQuestionToTestPool,
    removeQuestionFromTestPool,
    getValidatedQuestionsCount
} = require("../controllers/teacherValidatedQuestionController");

const router = express.Router();

// Get validated questions for a specific test
router.get("/test/:testId", getValidatedQuestionsForTest);

// Get validated questions by modules (for showing available questions)
router.get("/by-modules", getValidatedQuestionsByModules);

// Get count of validated questions by modules
router.get("/count", getValidatedQuestionsCount);

// Add question to test pool
router.post("/", addQuestionToTestPool);

// Remove question from test pool
router.delete("/:id", removeQuestionFromTestPool);

module.exports = router;
