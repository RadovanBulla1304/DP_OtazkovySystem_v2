const { validate, validated } = require("../util/validation");
const { throwError } = require("../util/universal");
const { createModul, editModul } = require("../schemas/modul.schema");
const Modul = require("../models/modul");
const Subject = require("../models/subject");

exports.createModul = [
    validate(createModul),
    async (req, res) => {
        const matched = validated(req);
        try {
            // Verify subject exists
            const subject = await Subject.findById(matched.subject);
            if (!subject) {
                return res.status(404).json({ message: "Subject not found" });
            }

            // Create and save modul
            const modul = new Modul(matched); // Now expects createdBy in matched data
            await modul.save();

            // Add modul to subject's moduls array
            subject.moduls.push(modul._id);
            await subject.save();

            res.status(201).json(modul);
        } catch (err) {
            throwError(`Error creating modul: ${err.message}`, 500);
        }
    }
];

exports.getAllModuls = [
    async (req, res) => {
        try {
            const moduls = await Modul.find({ deleted: false }, { __v: 0 })
                .populate('subject', 'name')
                .populate('createdBy', 'name email');
            res.status(200).json(moduls);
        } catch (err) {
            throwError(`Error fetching moduls: ${err.message}`, 500);
        }
    }
];

exports.getModulById = [
    async (req, res) => {
        try {
            const modul = await Modul.findById(req.params.id)
                .populate('subject', 'name')
                .populate('createdBy', 'name email');

            if (!modul || modul.deleted) {
                return res.status(404).json({ message: "Modul not found" });
            }

            res.status(200).json(modul);
        } catch (err) {
            throwError(`Error fetching modul: ${err.message}`, 500);
        }
    }
];

exports.getModulsBySubject = [
    async (req, res) => {
        try {
            const moduls = await Modul.find({
                subject: req.params.subjectId,
                deleted: false
            }, { __v: 0 })
                .populate('createdBy', 'name email');

            res.status(200).json(moduls);
        } catch (err) {
            throwError(`Error fetching moduls by subject: ${err.message}`, 500);
        }
    }
];
exports.deleteAllModulsBySubject = [
    async (req, res) => {
        try {
            const subjectId = req.params.subjectId;

            // Soft delete all moduls with the given subject
            const result = await Modul.updateMany(
                { subject: subjectId, deleted: false },
                { $set: { deleted: true } }
            );

            res.status(200).json({ message: "All moduls for the subject deleted successfully", modifiedCount: result.modifiedCount });
        } catch (err) {
            throwError(`Error deleting moduls by subject: ${err.message}`, 500);
        }
    }
];

exports.editModul = [
    validate(editModul),
    async (req, res) => {
        const data = validated(req);
        try {
            const modul = await Modul.findOne({
                _id: req.params.id,
                deleted: false
            });

            if (!modul) {
                return res.status(404).json({ message: "Modul not found" });
            }

            // Prevent changing subject if specified
            if (data.subject && data.subject !== modul.subject.toString()) {
                return res.status(400).json({ message: "Cannot change modul's subject" });
            }

            Object.assign(modul, data);
            await modul.save();

            res.status(200).json(modul);
        } catch (err) {
            throwError(`Error updating modul: ${err.message}`, 500);
        }
    }
];

exports.deleteModul = [
    async (req, res) => {
        try {
            const modul = await Modul.findById(req.params.id);

            if (!modul) {
                return res.status(404).json({ message: "Modul not found" });
            }

            // Soft delete
            modul.deleted = true;
            await modul.save();

            // Remove from subject's moduls array
            await Subject.updateOne(
                { _id: modul.subject },
                { $pull: { moduls: modul._id } }
            );

            res.status(200).json({ message: "Modul deleted successfully" });
        } catch (err) {
            throwError(`Error deleting modul: ${err.message}`, 500);
        }
    }
];