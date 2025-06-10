const { throwError } = require("../util/universal");
const { validate, validated } = require("../util/validation");
const { createQuestionRating, editQuestionRating } = require("../schemas/questionRating.schema");

const QuestionRating = require("../models/questionRating");

/**
 * GET all ratings for a question
 */
exports.getRatingsByQuestionId = async (req, res) => {
    try {
        const ratings = await QuestionRating.find({ question: req.params.questionId });
        res.status(200).json(ratings);
    } catch (err) {
        throwError(`Error fetching ratings: ${err.message}`, 500);
    }
};

/**
 * GET all ratings by a user
 */
exports.getRatingsByUserId = async (req, res) => {
    try {
        const ratings = await QuestionRating.find({ ratedBy: req.params.userId });
        res.status(200).json(ratings);
    } catch (err) {
        throwError(`Error fetching ratings by user: ${err.message}`, 500);
    }
};

/**
 * CREATE a new question rating
 */
exports.createQuestionRating = [
    validate(createQuestionRating),
    async (req, res) => {
        try {
            const data = validated(req);

            // Prevent duplicate rating by same user for same question
            const existing = await QuestionRating.findOne({
                question: data.question,
                ratedBy: data.ratedBy
            });
            if (existing) {
                return res.status(400).json({ message: "You have already rated this question." });
            }

            const rating = new QuestionRating(data);
            await rating.save();
            res.status(201).json(rating);
        } catch (err) {
            throwError(`Error creating question rating: ${err.message}`, 500);
        }
    }
];

/**
 * EDIT a question rating
 */
exports.editQuestionRating = [
    validate(editQuestionRating),
    async (req, res) => {
        try {
            const data = validated(req);
            const rating = await QuestionRating.findById(req.params.id);
            if (!rating) {
                return res.status(404).json({ message: "Rating not found." });
            }

            // Only allow the user who created the rating to edit it
            if (req.body.ratedBy && rating.ratedBy.toString() !== req.body.ratedBy) {
                return res.status(403).json({ message: "You can only edit your own rating." });
            }

            Object.assign(rating, data);
            await rating.save();
            res.status(200).json(rating);
        } catch (err) {
            throwError(`Error editing question rating: ${err.message}`, 500);
        }
    }
];

/**
 * DELETE a question rating
 */
exports.deleteQuestionRating = async (req, res) => {
    try {
        const rating = await QuestionRating.findByIdAndDelete(req.params.id);
        if (!rating) {
            return res.status(404).json({ message: "Rating not found." });
        }
        res.status(200).json({ message: "Rating deleted." });
    } catch (err) {
        throwError(`Error deleting question rating: ${err.message}`, 500);
    }
};