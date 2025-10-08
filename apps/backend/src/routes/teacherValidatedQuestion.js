const express = require("express");
const {
    getValidatedQuestionsByModules,
    getValidatedQuestionsCount
} = require("../controllers/teacherValidatedQuestionController");

const router = express.Router();

// Get validated questions by modules (for showing available questions)
router.get("/by-modules", getValidatedQuestionsByModules);

// Get count of validated questions by modules
router.get("/count", getValidatedQuestionsCount);


module.exports = router;
