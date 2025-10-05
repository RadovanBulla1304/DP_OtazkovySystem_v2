const express = require("express");
const router = express.Router();
const {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignUsersToProject,
    removeUserFromProject,
    getUserProjects
} = require("../controllers/projectController");


// Project CRUD routes
router.post("/", createProject);                    // Create new project
router.get("/", getAllProjects);                    // Get all projects (with optional filters)
router.get("/my-projects", getUserProjects);        // Get projects assigned to current user
router.get("/:id", getProjectById);                 // Get project by ID
router.put("/:id", updateProject);                  // Update project
router.delete("/:id", deleteProject);               // Delete project

// User assignment routes
router.post("/:id/assign-users", assignUsersToProject);     // Assign users to project
router.delete("/:id/users/:userId", removeUserFromProject); // Remove user from project

module.exports = router;
