const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");

const Subject = require("../models/subject");
const User = require("../models/user");
const Teacher = require("../models/teacher");

const { validate, validated } = require("../util/validation");
const { createSubject, editSubject } = require("../schemas/subject.schema");


exports.createSubject = [
    validate(createSubject), // Validate the request body using the createSubject schema
    async (req, res) => {
        const matched = validated(req); // Extract validated data
        try {
            const teacherId = req.user.user_id; // Get the teacher ID from the authenticated user

            // Create subject with the creating teacher automatically assigned
            const subjectData = {
                ...matched,
                assigned_teachers: [teacherId] // Automatically assign the creator
            };

            const subject = new Subject(subjectData); // Create a new Subject instance
            await subject.save(); // Save the subject to the database

            // Also add subject to teacher's assigned_subjects
            const teacher = await Teacher.findById(teacherId);
            if (teacher) {
                if (!Array.isArray(teacher.assigned_subjects)) {
                    teacher.assigned_subjects = [];
                }
                if (!teacher.assigned_subjects.map(String).includes(String(subject._id))) {
                    teacher.assigned_subjects.push(subject._id);
                    await teacher.save();
                }
            }

            res.status(201).json(subject); // Respond with the created subject
        } catch (err) {
            throwError(`Error creating subject: ${err.message}`, 500); // Handle errors
        }
    },
];
exports.getAllSubjects = [
    async (req, res) => {
        try {
            const teacherId = req.user.user_id;
            const teacher = await Teacher.findById(teacherId);

            if (!teacher) {
                return res.status(404).json({ message: "Teacher not founddddd" });
            }

            let subjects;

            // If teacher is admin, show all subjects
            if (teacher.isAdmin) {
                subjects = await Subject.find({}, { __v: 0 })
                    .populate('assigned_teachers', 'name surname email');
            } else {
                // If not admin, show only subjects where teacher is assigned
                subjects = await Subject.find(
                    { assigned_teachers: teacherId },
                    { __v: 0 }
                ).populate('assigned_teachers', 'name surname email');
            }

            res.status(200).json(subjects);
        } catch (err) {
            throwError(`Error fetching subjects: ${err.message}`, 500);
        }
    },
];


// TODO : Optimalizovat
exports.getAllSubjectsAssignedToUser = [
    async (req, res) => {
        try {
            const userId = req.user.user_id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            let subjects;

            // If not admin, show only subjects where teacher is assigned
            subjects = await Subject.find(
                { assigned_students: userId },
                { __v: 0 }
            ).populate('assigned_students', 'name surname email');


            res.status(200).json(subjects);
        } catch (err) {
            throwError(`Error fetching subjects: ${err.message}`, 500);
        }
    },
];

// Get subjects for a specific teacher (for non-admin teachers)
exports.getTeacherSubjects = [
    async (req, res) => {
        try {
            const teacherId = req.user.user_id;

            const subjects = await Subject.find(
                { assigned_teachers: teacherId },
                { __v: 0 }
            ).populate('assigned_teachers', 'name surname email');

            res.status(200).json(subjects);
        } catch (err) {
            throwError(`Error fetching teacher subjects: ${err.message}`, 500);
        }
    }
];
exports.editSubject = [
    validate(editSubject), // Validate the request body using the createSubject schema
    async (req, res) => {
        const data = validated(req); // Extract validated data

        try {
            const subject = await Subject.findOne({ _id: req.params.id }); // Find the subject by ID
            if (!subject) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") }); // Handle not found
            }

            Object.assign(subject, data); // Update the subject with the new data
            await subject.save(); // Save the updated subject to the database

            res.status(200).json(subject); // Respond with the updated subject
        } catch (err) {
            throwError(`${req.t("messages.database_error")}: ${err.message}`, 500); // Handle errors
        }
    },
];
exports.deleteSubject = [
    async (req, res) => {
        try {
            const subject = await Subject.findOneAndDelete({ _id: req.params.id }); // Find and delete the subject by ID
            if (!subject) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") }); // Handle not found
            }
            res.status(200).json({ message: req.t("messages.record_deleted") }); // Respond with success message
        } catch (err) {
            throwError(`${req.t("messages.database_error")}: ${err.message}`, 500); // Handle errors
        }
    },
];

exports.asignUserToSubject = [
    async (req, res) => {
        try {
            const { subjectId, userId } = req.body;

            // Validate IDs
            if (!subjectId || !userId) {
                return res.status(400).json({ message: "subjectId and userId are required." });
            }

            // Find subject
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") || "Subject not found" });
            }

            // Support multiple userIds
            const userIds = Array.isArray(userId) ? userId : [userId];

            // Validate all users exist
            const users = await User.find({ _id: { $in: userIds } });
            if (users.length !== userIds.length) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") || "One or more users not found" });
            }

            // Add users to assigned_students if not already present
            if (!Array.isArray(subject.assigned_students)) {
                subject.assigned_students = [];
            }
            for (const id of userIds) {
                if (!subject.assigned_students.map(String).includes(String(id))) {
                    subject.assigned_students.push(id);
                }
                // Also add subject to user's assignedSubjects if not already present
                const user = await User.findById(id);
                if (user) {
                    if (!Array.isArray(user.assignedSubjects)) {
                        user.assignedSubjects = [];
                    }
                    if (!user.assignedSubjects.map(String).includes(String(subject._id))) {
                        user.assignedSubjects.push(subject._id);
                        await user.save();
                    }
                }
            }
            await subject.save();

            res.status(200).json({ message: "Používateľ bol priradený k predmetu.", subject });
        } catch (err) {
            throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
        }
    }
];
exports.unasignUserFromSubject = [
    async (req, res) => {
        try {
            const { subjectId, userId } = req.body;

            // Validate IDs
            if (!subjectId || !userId) {
                return res.status(400).json({ message: "subjectId and userId are required." });
            }

            // Find subject
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") || "Subject not found" });
            }

            // Support multiple userIds
            const userIds = Array.isArray(userId) ? userId : [userId];

            // Remove users from assigned_students (not assignedUsers)
            if (!Array.isArray(subject.assigned_students)) {
                subject.assigned_students = [];
            }

            subject.assigned_students = subject.assigned_students.filter(
                (id) => !userIds.includes(id.toString())
            );

            // Also remove subject from user's assignedSubjects
            for (const id of userIds) {
                const user = await User.findById(id);
                if (user && Array.isArray(user.assignedSubjects)) {
                    user.assignedSubjects = user.assignedSubjects.filter(
                        (subjId) => subjId.toString() !== subjectId.toString()
                    );
                    await user.save();
                }
            }

            await subject.save();

            res.status(200).json({ message: "Používateľ bol odobraný z predmetu.", subject });
        } catch (err) {
            throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
        }
    }
];
exports.getSubjectById = [
    async (req, res) => {
        try {
            const subject = await Subject.findById(req.params.id, { __v: 0 })
                .populate('assigned_teachers', 'name surname email isAdmin'); // Populate teacher details
            if (!subject) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") }); // Handle not found
            }
            res.status(200).json(subject); // Respond with the found subject
        } catch (err) {
            throwError(`${req.t("messages.database_error")}: ${err.message}`, 500); // Handle errors
        }
    },
];

// Assign teacher to subject
exports.assignTeacherToSubject = [
    async (req, res) => {
        try {
            const { subjectId, teacherId } = req.body;

            // Validate IDs
            if (!subjectId || !teacherId) {
                return res.status(400).json({ message: "subjectId and teacherId are required." });
            }

            // Find subject
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(404).json({ message: "Subject not found" });
            }

            // Support multiple teacherIds
            const teacherIds = Array.isArray(teacherId) ? teacherId : [teacherId];

            // Validate all teachers exist
            const teachers = await Teacher.find({ _id: { $in: teacherIds } });
            if (teachers.length !== teacherIds.length) {
                return res.status(404).json({ message: "One or more teachers not found" });
            }

            // Add teachers to assigned_teachers if not already present
            if (!Array.isArray(subject.assigned_teachers)) {
                subject.assigned_teachers = [];
            }

            for (const id of teacherIds) {
                if (!subject.assigned_teachers.map(String).includes(String(id))) {
                    subject.assigned_teachers.push(id);
                }

                // Also add subject to teacher's assigned_subjects
                const teacher = await Teacher.findById(id);
                if (teacher) {
                    if (!Array.isArray(teacher.assigned_subjects)) {
                        teacher.assigned_subjects = [];
                    }
                    if (!teacher.assigned_subjects.map(String).includes(String(subject._id))) {
                        teacher.assigned_subjects.push(subject._id);
                        await teacher.save();
                    }
                }
            }

            await subject.save();

            // Populate and return updated subject
            await subject.populate('assigned_teachers', 'name surname email');

            res.status(200).json({
                message: "Učiteľ bol priradený k predmetu.",
                subject
            });
        } catch (err) {
            res.status(500).json({
                message: "Error assigning teacher to subject",
                error: err.message
            });
        }
    }
];

// Unassign teacher from subject
exports.unassignTeacherFromSubject = [
    async (req, res) => {
        try {
            const { subjectId, teacherId } = req.body;

            // Validate IDs
            if (!subjectId || !teacherId) {
                return res.status(400).json({ message: "subjectId and teacherId are required." });
            }

            // Find subject
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(404).json({ message: "Subject not found" });
            }

            // Support multiple teacherIds
            const teacherIds = Array.isArray(teacherId) ? teacherId : [teacherId];

            // Remove teachers from assigned_teachers
            if (!Array.isArray(subject.assigned_teachers)) {
                subject.assigned_teachers = [];
            }

            subject.assigned_teachers = subject.assigned_teachers.filter(
                (id) => !teacherIds.includes(id.toString())
            );

            // Also remove subject from teacher's assigned_subjects
            for (const id of teacherIds) {
                const teacher = await Teacher.findById(id);
                if (teacher && Array.isArray(teacher.assigned_subjects)) {
                    teacher.assigned_subjects = teacher.assigned_subjects.filter(
                        (subjId) => subjId.toString() !== subjectId.toString()
                    );
                    await teacher.save();
                }
            }

            await subject.save();

            // Populate and return updated subject
            await subject.populate('assigned_teachers', 'name surname email');

            res.status(200).json({
                message: "Učiteľ bol odobraný z predmetu.",
                subject
            });
        } catch (err) {
            res.status(500).json({
                message: "Error unassigning teacher from subject",
                error: err.message
            });
        }
    }
];

exports.triggerYearlyUnassignment = async (req, res) => {
    try {
        const { triggerManualUnassignment } = require('../jobs/yearlyUnassignment');
        const result = await triggerManualUnassignment();

        res.status(200).json({
            message: "Yearly unassignment triggered successfully",
            result
        });
    } catch (err) {
        res.status(500).json({
            message: "Error triggering yearly unassignment",
            error: err.message
        });
    }
};

