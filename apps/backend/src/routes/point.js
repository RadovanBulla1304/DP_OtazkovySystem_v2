const express = require("express");
const router = express.Router();
const pointController = require("../controllers/pointController");

// Get routes - Available to authenticated users
router.get("/user/:userId", pointController.getUserPoints);
router.get("/user/:userId/summary", pointController.getUserPointsSummary);
router.post("/users/summary", pointController.getUsersPointsSummary);

// Award points routes - Only available to teachers
// Week 1 - Question Creation
router.post("/award/week1", pointController.awardPointsForQuestionCreation);
// Week 2 - Question Validation
router.post("/award/week2", pointController.awardPointsForQuestionValidation);
// Week 3 - Question Reparation
router.post("/award/week3", pointController.awardPointsForQuestionReparation);
// Custom points
router.post("/award/custom", pointController.awardCustomPoints);

module.exports = router;