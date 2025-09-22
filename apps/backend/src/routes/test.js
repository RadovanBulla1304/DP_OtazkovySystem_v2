const express = require("express");
const {
    createTest,
    getTestsBySubject,
    getTestsByTeacher,
    getTestById,
    updateTest,
    deleteTest,
    toggleTestPublication,
    getTestStatistics
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

module.exports = router;