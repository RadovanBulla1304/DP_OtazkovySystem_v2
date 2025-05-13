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