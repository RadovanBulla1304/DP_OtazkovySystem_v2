const express = require("express");
const {
    createQuestion,
    editQuestion,
    deleteQuestion
} = require("../controllers/questionController");

const router = express.Router();

router.post("/", createQuestion);         // Create a new question
router.put("/:id", editQuestion);         // Edit a question by ID
router.delete("/:id", deleteQuestion);    // Delete a question by ID

module.exports = router;