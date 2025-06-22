const express = require("express");
const {
    createQuestionRating,
    editQuestionRating,
    deleteQuestionRating,
    getRatingsByQuestionId,
    getRatingsByUserId,
    getAllRatings,
} = require("../controllers/questionRatingController");

const router = express.Router();

// Get all ratings for a specific question
router.get("/question/:questionId", getRatingsByQuestionId);

// Get all ratings by a specific user
router.get("/user/:userId", getRatingsByUserId);

// Create a new question rating
router.post("/", createQuestionRating);

router.get("/", getAllRatings);
// Edit a question rating by ID
router.put("/:id", editQuestionRating);

// Delete a question rating by ID
router.delete("/:id", deleteQuestionRating);

module.exports = router;