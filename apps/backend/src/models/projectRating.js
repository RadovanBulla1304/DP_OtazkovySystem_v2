const mongoose = require("mongoose");

const ProjectRatingSchema = new mongoose.Schema(
    {
        // The user who is rating (student)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // The project that the user belongs to (their own project)
        userProject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        // The project being rated (another team's project)
        ratedProject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        // The rating score given
        rating: {
            type: Number,
            required: true,
            min: 0,
        },
        // Optional comment
        comment: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
ProjectRatingSchema.index({ user: 1, ratedProject: 1 }, { unique: true }); // User can rate each project only once
ProjectRatingSchema.index({ userProject: 1 });
ProjectRatingSchema.index({ ratedProject: 1 });

// Validation: User cannot rate their own project
ProjectRatingSchema.pre("save", function (next) {
    if (this.userProject.equals(this.ratedProject)) {
        const error = new Error("Cannot rate your own project");
        next(error);
    } else {
        next();
    }
});

module.exports = mongoose.model("ProjectRating", ProjectRatingSchema);
