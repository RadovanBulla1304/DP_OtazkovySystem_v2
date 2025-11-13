const mongoose = require("mongoose");
const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");


const User = require("../models/user");
const Teacher = require("../models/teacher");
const { validate, validated } = require("../util/validation");


// Get current teacher info (me)
exports.meTeacher = async (req, res) => {
    try {
        if (req.user && req.user.user_id) {
            const teacher = await Teacher.findById(req.user.user_id, { password: 0, __v: 0 });
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            return res.status(200).json(teacher);
        } else {
            return res.status(401).json({ message: 'Not authenticated' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
exports.getAllUsersAssignedToSubject = [
    async (req, res) => {
        try {
            const { subjectId } = req.params;
            if (!subjectId) {
                return res.status(400).send({ message: 'Subject ID is required' });
            }

            const users = await User.find(
                {
                    email: {
                        $nin: ["superAdmin@uniza.sk", "admin@admin.com"],
                    },
                    assignedSubjects: new mongoose.Types.ObjectId(subjectId)
                },
                {
                    password: 0,
                    salt: 0,
                    __v: 0,
                }
            );
            res.status(200).send(users);
        } catch (err) {
            throwError(err.message, 500);
        }
    },
];