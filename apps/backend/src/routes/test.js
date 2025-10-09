const express = require("express");
const {
    createTest,
    getTestsBySubject,
    getTestsByTeacher,
    getTestById,
    updateTest,
    deleteTest,
    toggleTestPublication,
    getTestStatistics,
    startTestAttempt,
    submitTestAttempt,
    getTestAttemptById,
    getUserTestAttempts,
    deleteTestAttempt
} = require("../controllers/testController");

const router = express.Router();

// Test CRUD operations
router.post("/", createTest);                               // Create a new test
router.get("/subject/:subjectId", getTestsBySubject);       // Get tests by subject ID
router.get("/teacher", getTestsByTeacher);                  // Get tests by teacher
router.get("/:id", getTestById);                           // Get a test by ID
router.put("/:id", updateTest);                            // Update a test by ID
router.delete("/:id", deleteTest);                         // Delete a test by ID

// Test publication
router.patch("/:id/publish", toggleTestPublication);       // Publish/unpublish a test

// Test statistics
router.get("/:id/statistics", getTestStatistics);          // Get test statistics

// Test attempts
router.post("/:id/start-attempt", startTestAttempt);       // Start a new test attempt with random questions
router.post("/attempt/:attemptId/submit", submitTestAttempt); // Submit test attempt with answers
router.get("/attempt/:attemptId", getTestAttemptById);     // Get test attempt details
router.get("/:id/user-attempts", getUserTestAttempts);     // Get user's attempts for a test
router.delete("/attempt/:attemptId", deleteTestAttempt);   // Delete a test attempt

module.exports = router;