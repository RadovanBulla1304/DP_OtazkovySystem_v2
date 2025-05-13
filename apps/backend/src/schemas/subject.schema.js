const Joi = require("joi");

const createSubject = Joi.object({
    name: Joi.string().required(), // Name is required
    assignedUsers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).default([]), // Array of valid MongoDB ObjectIds
});

const editSubject = Joi.object({
    name: Joi.string(), // Name is optional for editing
    assignedUsers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)), // Optional array of valid MongoDB ObjectIds
});

module.exports = {
    createSubject,
    editSubject,
};
