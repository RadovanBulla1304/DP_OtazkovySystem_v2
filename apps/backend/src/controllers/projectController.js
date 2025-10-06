const Project = require("../models/project");
const User = require("../models/user");
const ProjectRating = require("../models/projectRating");

// Create a new project
const createProject = async (req, res) => {
    try {
        const { name, description, max_members, subject } = req.body;
        const teacherId = req.user.user_id;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Project name is required"
            });
        }

        const project = new Project({
            name,
            description: description || "",
            max_members: max_members || 5,
            subject: subject || null,
            createdBy: teacherId,
            assigned_users: []
        });

        await project.save();

        // Populate the project before sending response
        await project.populate("createdBy", "name email");
        await project.populate("subject", "name");
        await project.populate("assigned_users", "name email username");

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({
            success: false,
            message: "Error creating project",
            error: error.message
        });
    }
};

// Get all projects (with optional subject filter)
const getAllProjects = async (req, res) => {
    try {
        const { subject, status } = req.query;
        const query = {};

        if (subject) {
            query.subject = subject;
        }

        if (status) {
            query.status = status;
        }

        const projects = await Project.find(query)
            .populate("createdBy", "name email")
            .populate("subject", "name")
            .populate("assigned_users", "name email username")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching projects",
            error: error.message
        });
    }
};

// Get project by ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id)
            .populate("createdBy", "name email")
            .populate("subject", "name")
            .populate("assigned_users", "name email username");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching project",
            error: error.message
        });
    }
};

// Update project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, max_members, subject, status, due_date } = req.body;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Update fields
        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (max_members !== undefined) project.max_members = max_members;
        if (subject !== undefined) project.subject = subject;
        if (status !== undefined) project.status = status;
        if (due_date !== undefined) project.due_date = due_date;

        await project.save();

        // Populate the project before sending response
        await project.populate("createdBy", "name email");
        await project.populate("subject", "name");
        await project.populate("assigned_users", "name email username");

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({
            success: false,
            message: "Error updating project",
            error: error.message
        });
    }
};

// Delete project
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByIdAndDelete(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting project",
            error: error.message
        });
    }
};

// Assign users to project
const assignUsersToProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User IDs array is required"
            });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Check if adding these users would exceed max_members
        const uniqueUserIds = [...new Set([...project.assigned_users.map(u => u.toString()), ...userIds])];

        if (uniqueUserIds.length > project.max_members) {
            return res.status(400).json({
                success: false,
                message: `Cannot assign users. Maximum members limit (${project.max_members}) would be exceeded.`
            });
        }

        // Verify all users exist
        const users = await User.find({ _id: { $in: userIds } });
        if (users.length !== userIds.length) {
            return res.status(400).json({
                success: false,
                message: "One or more users not found"
            });
        }

        // Add users to project (avoid duplicates)
        userIds.forEach(userId => {
            if (!project.assigned_users.includes(userId)) {
                project.assigned_users.push(userId);
            }
        });

        await project.save();

        // Populate the project before sending response
        await project.populate("createdBy", "name email");
        await project.populate("subject", "name");
        await project.populate("assigned_users", "name email username");

        res.status(200).json({
            success: true,
            data: project,
            message: `${userIds.length} user(s) assigned to project successfully`
        });
    } catch (error) {
        console.error("Error assigning users to project:", error);
        res.status(500).json({
            success: false,
            message: "Error assigning users to project",
            error: error.message
        });
    }
};

// Remove user from project
const removeUserFromProject = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        project.assigned_users = project.assigned_users.filter(
            user => user.toString() !== userId
        );

        await project.save();

        // Populate the project before sending response
        await project.populate("createdBy", "name email");
        await project.populate("subject", "name");
        await project.populate("assigned_users", "name email username");

        res.status(200).json({
            success: true,
            data: project,
            message: "User removed from project successfully"
        });
    } catch (error) {
        console.error("Error removing user from project:", error);
        res.status(500).json({
            success: false,
            message: "Error removing user from project",
            error: error.message
        });
    }
};

// Get projects by user (for students to see their assigned projects)
const getUserProjects = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const projects = await Project.find({
            assigned_users: userId,
            status: { $ne: "cancelled" }
        })
            .populate("createdBy", "name email")
            .populate("subject", "name")
            .populate("assigned_users", "name email username")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error("Error fetching user projects:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user projects",
            error: error.message
        });
    }
};

// Save or update a project rating
const saveProjectRating = async (req, res) => {
    try {
        const { ratedProjectId, rating, comment } = req.body;
        const userId = req.user.user_id;

        if (!ratedProjectId || rating === undefined || rating === null) {
            return res.status(400).json({
                success: false,
                message: "Rated project ID and rating are required"
            });
        }

        // Find the user's project
        const userProject = await Project.findOne({
            assigned_users: userId
        });

        if (!userProject) {
            return res.status(404).json({
                success: false,
                message: "You are not assigned to any project"
            });
        }

        // Check if trying to rate own project
        if (userProject._id.toString() === ratedProjectId) {
            return res.status(400).json({
                success: false,
                message: "Cannot rate your own project"
            });
        }

        // Verify rated project exists
        const ratedProject = await Project.findById(ratedProjectId);
        if (!ratedProject) {
            return res.status(404).json({
                success: false,
                message: "Rated project not found"
            });
        }

        // Find existing rating or create new one
        let projectRating = await ProjectRating.findOne({
            user: userId,
            ratedProject: ratedProjectId
        });

        if (projectRating) {
            // Update existing rating
            projectRating.rating = rating;
            projectRating.comment = comment || "";
            projectRating.userProject = userProject._id;
        } else {
            // Create new rating
            projectRating = new ProjectRating({
                user: userId,
                userProject: userProject._id,
                ratedProject: ratedProjectId,
                rating,
                comment: comment || ""
            });
        }

        await projectRating.save();

        res.status(200).json({
            success: true,
            data: projectRating,
            message: "Rating saved successfully"
        });
    } catch (error) {
        console.error("Error saving project rating:", error);
        res.status(500).json({
            success: false,
            message: "Error saving project rating",
            error: error.message
        });
    }
};

// Get all ratings for the peer evaluation grid
const getAllProjectRatings = async (req, res) => {
    try {
        const { subjectId } = req.query;

        // Build query to get projects (optionally filtered by subject)
        const projectQuery = {};
        if (subjectId) {
            projectQuery.subject = subjectId;
        }

        // Get all projects
        const projects = await Project.find(projectQuery)
            .populate("assigned_users", "name email username studentNumber")
            .sort({ name: 1 });

        // Get all ratings for these projects
        const projectIds = projects.map(p => p._id);
        const ratings = await ProjectRating.find({
            ratedProject: { $in: projectIds }
        })
            .populate("user", "name email username studentNumber")
            .populate("userProject", "name")
            .populate("ratedProject", "name");

        // Get all unique students from all projects
        const allStudents = new Map();
        projects.forEach(project => {
            project.assigned_users.forEach(user => {
                if (!allStudents.has(user._id.toString())) {
                    allStudents.set(user._id.toString(), {
                        ...user.toObject(),
                        projectId: project._id,
                        projectName: project.name
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                projects,
                ratings,
                students: Array.from(allStudents.values())
            }
        });
    } catch (error) {
        console.error("Error fetching project ratings:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching project ratings",
            error: error.message
        });
    }
};

// Get rating summary (sum of ratings per project)
const getProjectRatingsSummary = async (req, res) => {
    try {
        const { subjectId } = req.query;

        // Build query to get projects (optionally filtered by subject)
        const projectQuery = {};
        if (subjectId) {
            projectQuery.subject = subjectId;
        }

        const projects = await Project.find(projectQuery);
        const projectIds = projects.map(p => p._id);

        // Aggregate ratings by project
        const summary = await ProjectRating.aggregate([
            {
                $match: {
                    ratedProject: { $in: projectIds }
                }
            },
            {
                $group: {
                    _id: "$ratedProject",
                    totalRating: { $sum: "$rating" },
                    averageRating: { $avg: "$rating" },
                    ratingCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "project"
                }
            },
            {
                $unwind: "$project"
            },
            {
                $project: {
                    projectId: "$_id",
                    projectName: "$project.name",
                    totalRating: 1,
                    averageRating: 1,
                    ratingCount: 1
                }
            },
            {
                $sort: { totalRating: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error("Error fetching project ratings summary:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching project ratings summary",
            error: error.message
        });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignUsersToProject,
    removeUserFromProject,
    getUserProjects,
    saveProjectRating,
    getAllProjectRatings,
    getProjectRatingsSummary
};
