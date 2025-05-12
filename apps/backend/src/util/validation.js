const i18next = require('i18next');
/**
 * Validates the request body against the given schema.
 *
 * @param {import('joi').Schema} schema
 * @returns {import('express').RequestHandler}
 */

const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const value = await schema.validateAsync(req.body, {
                abortEarly: false,
                allowUnknown: true,
                stripUnknown: true,
                context: { req }
            });

            req.validated = value;
            next();
        } catch (error) {
            const errorMessages = error.details.map((detail) => {
                return `${detail.path.join(',')} - ${i18next.t(detail.message)}`;
            });
            // return res.status(400).json({ errors: errorMessages });
            next({ statusCode: 422, message: errorMessages });
        }
    };
};

/**
 * Returns the validated data from the request.
 * @param {import('express').Request} req
 * @returns {any}
 */
const validated = (req) => {
    return req.validated;
};

module.exports = { validate, validated };
