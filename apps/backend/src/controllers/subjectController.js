const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");

const Subject = require("../models/subject");
const User = require("../models/user");

const { validate, validated } = require("../util/validation");
const { createSubject, editSubject } = require("../schemas/subject.schema");


exports.createSubject = [
    validate(createSubject), // Validate the request body using the createSubject schema
    async (req, res) => {
        const matched = validated(req); // Extract validated data
        try {
            const subject = new Subject(matched); // Create a new Subject instance
            await subject.save(); // Save the subject to the database
            res.status(201).json(subject); // Respond with the created subject
        } catch (err) {
            throwError(`Error creating subject: ${err.message}`, 500); // Handle errors
        }
    },
];
exports.getAllSubjects = [
    async (req, res) => {
        try {
            const subjects = await Subject.find({}, { __v: 0 }); // Exclude the __v field
            res.status(200).json(subjects); // Respond with the list of subjects
        } catch (err) {
            throwError(`Error fetching subjects: ${err.message}`, 500); // Handle errors
        }
    },
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

            // Find subject and user
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") || "Subject not found" });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") || "User not found" });
            }

            // Add user to assignedUsers if not already present
            if (!subject.assignedUsers.includes(userId)) {
                subject.assignedUsers.push(userId);
                await subject.save();
            }

            res.status(200).json({ message: "Používateľ bol priradený k predmetu.", subject });
        } catch (err) {
            throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
        }
    }
];
exports.getSubjectById = [
    async (req, res) => {
        try {
            const subject = await Subject.findById(req.params.id, { __v: 0 }); // Find the subject by ID and exclude the __v field
            if (!subject) {
                return res.status(404).json({ message: req.t("messages.record_not_exists") }); // Handle not found
            }
            res.status(200).json(subject); // Respond with the found subject
        } catch (err) {
            throwError(`${req.t("messages.database_error")}: ${err.message}`, 500); // Handle errors
        }
    },
];