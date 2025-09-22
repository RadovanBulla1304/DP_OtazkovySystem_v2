const ForumQuestion = require("../models/forumQuestion")
const Comment = require("../models/comment")
const Module = require("../models/modul")

// @desc Get all forum questions
// @route GET /api/forum/questions
// @access Private
const getForumQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, modul, tags, search } = req.query

        // Build filter object
        let filter = {}

        if (modul) {
            filter.modul = modul
        }

        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim())
            filter.tags = { $in: tagArray }
        }

        if (search) {
            filter.$or = [
                { header: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ]
        }

        const questions = await ForumQuestion.find(filter)
            .populate('createdBy', 'username email avatar')
            .populate('modul', 'name')
            .sort({ is_pinned: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean()

        const total = await ForumQuestion.countDocuments(filter)

        res.status(200).json({
            success: true,
            data: questions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalQuestions: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        })
    } catch (error) {
        console.error('Get forum questions error:', error)
        res.status(500).json({
            success: false,
            message: "Server error while fetching forum questions",
            error: error.message
        })
    }
}

// @desc Get single forum question with comments
// @route GET /api/forum/questions/:id
// @access Private
const getForumQuestion = async (req, res) => {
    try {
        const { id } = req.params

        const question = await ForumQuestion.findById(id)
            .populate('createdBy', 'username email avatar')
            .populate('modul', 'name')
            .lean()

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Forum question not found"
            })
        }

        // Get comments with nested structure
        const comments = await Comment.find({
            forum_question: id,
            parent: null
        })
            .populate('createdBy', 'username email avatar')
            .populate({
                path: 'replies',
                populate: {
                    path: 'createdBy',
                    select: 'username email avatar'
                }
            })
            .sort({ createdAt: 1 })
            .lean()

        // Recursively populate nested replies
        const populateNestedReplies = async (comments) => {
            for (let comment of comments) {
                if (comment.replies && comment.replies.length > 0) {
                    comment.replies = await Comment.populate(comment.replies, {
                        path: 'replies',
                        populate: {
                            path: 'createdBy',
                            select: 'username email avatar'
                        }
                    })
                    await populateNestedReplies(comment.replies)
                }
            }
        }

        await populateNestedReplies(comments)

        res.status(200).json({
            success: true,
            data: {
                question,
                comments
            }
        })
    } catch (error) {
        console.error('Get forum question error:', error)
        res.status(500).json({
            success: false,
            message: "Server error while fetching forum question",
            error: error.message
        })
    }
}

// @desc Create new forum question
// @route POST /api/forum/questions
// @access Private
const createForumQuestion = async (req, res) => {
    try {
        const { header, description, tags, modul } = req.body
        const user_id = req.user?.user_id

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            })
        }

        // Validate required fields
        if (!header || !description || !modul) {
            return res.status(400).json({
                success: false,
                message: "Header, description, and module are required"
            })
        }

        // Verify module exists
        const moduleExists = await Module.findById(modul)
        if (!moduleExists) {
            return res.status(400).json({
                success: false,
                message: "Module not found"
            })
        }

        // Process tags
        const processedTags = tags ? tags.map(tag => tag.toLowerCase().trim()) : []

        const forumQuestion = await ForumQuestion.create({
            header: header.trim(),
            description: description.trim(),
            tags: processedTags,
            modul,
            createdBy: user_id
        })

        const populatedQuestion = await ForumQuestion.findById(forumQuestion._id)
            .populate('createdBy', 'username email avatar')
            .populate('modul', 'name')
            .lean()

        res.status(201).json({
            success: true,
            message: "Forum question created successfully",
            data: populatedQuestion
        })
    } catch (error) {
        console.error('Create forum question error:', error)
        res.status(500).json({
            success: false,
            message: "Server error while creating forum question",
            error: error.message
        })
    }
}

// @desc Add comment to forum question
// @route POST /api/forum/questions/:id/comments
// @access Private
const addComment = async (req, res) => {
    try {
        const { id } = req.params
        const { content, parentComment } = req.body
        const user_id = req.user?.user_id

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            })
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            })
        }

        // Verify forum question exists
        const forumQuestion = await ForumQuestion.findById(id)
        if (!forumQuestion) {
            return res.status(404).json({
                success: false,
                message: "Forum question not found"
            })
        }

        // If this is a reply, verify parent comment exists
        if (parentComment) {
            const parentExists = await Comment.findById(parentComment)
            if (!parentExists) {
                return res.status(400).json({
                    success: false,
                    message: "Parent comment not found"
                })
            }
        }

        const comment = await Comment.create({
            content: content.trim(),
            forum_question: id,
            createdBy: user_id,
            parent: parentComment || null
        })

        // Update comments count on forum question
        await ForumQuestion.findByIdAndUpdate(id, {
            $inc: { comments_count: 1 }
        })

        // If this is a reply, update replies count on parent comment
        if (parentComment) {
            await Comment.findByIdAndUpdate(parentComment, {
                $inc: { replies_count: 1 }
            })
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate('createdBy', 'username email avatar')
            .lean()

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: populatedComment
        })
    } catch (error) {
        console.error('Add comment error:', error)
        res.status(500).json({
            success: false,
            message: "Server error while adding comment",
            error: error.message
        })
    }
}

module.exports = {
    getForumQuestions,
    getForumQuestion,
    createForumQuestion,
    addComment
}