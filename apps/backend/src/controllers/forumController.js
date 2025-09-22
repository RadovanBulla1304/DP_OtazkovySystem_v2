const ForumQuestion = require("../models/forumQuestion")
const Comment = require("../models/comment")
const Module = require("../models/modul")
const mongoose = require("mongoose")

// Helper: safely extract an ID string from possible shapes (ObjectId, subdoc { user }, nested user object)
const safeExtractId = (elem) => {
    if (!elem) return null
    // subdocument shape: { user: ObjectId | { _id: ... } }
    if (elem.user) {
        const u = elem.user._id ? elem.user._id : elem.user
        return u ? u.toString() : null
    }
    // if element itself is an object with _id
    if (elem._id) {
        return elem._id.toString()
    }
    try {
        return elem.toString()
    } catch (e) {
        return null
    }
}

// Convert array of mixed id-like values to an array of valid ObjectId instances (deduped)
const toValidObjectIdArray = (items) => {
    const set = new Set((items || []).map(safeExtractId).filter(Boolean))
    const out = []
    for (const s of set) {
        if (mongoose.isValidObjectId(s)) {
            out.push(new mongoose.Types.ObjectId(s))
        }
    }
    return out
}

// @desc Get all forum questions
// @route GET /api/forum/questions
// @access Private
const getForumQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, modul, tags, search } = req.query
        const user_id = req.user?.user_id

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            })
        }

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

        // Add user interaction status
        const questionsWithUserStatus = questions.map(question => {
            const userLiked = question.likes.some(like => (like && like.toString()) === user_id)
            const userDisliked = question.dislikes.some(dislike => (dislike && dislike.toString()) === user_id)

            // Remove the full likes/dislikes arrays to reduce payload size
            const { likes, dislikes, ...questionData } = question

            return {
                ...questionData,
                user_liked: userLiked,
                user_disliked: userDisliked
            }
        })

        const total = await ForumQuestion.countDocuments(filter)

        res.status(200).json({
            success: true,
            data: questionsWithUserStatus,
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
        const user_id = req.user?.user_id

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            })
        }

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

        // Add user interaction status to question
        const userLiked = question.likes.some(like => (like && like.toString()) === user_id)
        const userDisliked = question.dislikes.some(dislike => (dislike && dislike.toString()) === user_id)
        const { likes, dislikes, ...questionData } = question
        const questionWithUserStatus = {
            ...questionData,
            user_liked: userLiked,
            user_disliked: userDisliked
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

        // Recursively populate nested replies and add user status
        const populateNestedReplies = async (comments) => {
            for (let comment of comments) {
                // Add user interaction status to comment
                const userLiked = comment.likes.some(like => (like && like.toString()) === user_id)
                const userDisliked = comment.dislikes.some(dislike => (dislike && dislike.toString()) === user_id)
                const { likes, dislikes, ...commentData } = comment

                Object.assign(comment, {
                    ...commentData,
                    user_liked: userLiked,
                    user_disliked: userDisliked
                })

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
                question: questionWithUserStatus,
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

// @desc Like forum question
// @route POST /api/forum/questions/:id/like
// @access Private
const likeForumQuestion = async (req, res) => {
    try {
        const { id } = req.params
        const user_id = req.user?.user_id

        console.log(`[LIKE] User ${user_id} attempting to like question ${id}`)

        if (!user_id) {
            console.log(`[LIKE] Authentication failed for question ${id}`)
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            })
        }

        const question = await ForumQuestion.findById(id)
        if (!question) {
            console.log(`[LIKE] Question ${id} not found`)
            return res.status(404).json({
                success: false,
                message: "Forum question not found"
            })
        }

        // Check current user status - use string comparison for robustness
        const userObjectId = new mongoose.Types.ObjectId(user_id)
        const alreadyLiked = question.likes.some(like => (like && like.toString()) === user_id)
        const alreadyDisliked = question.dislikes.some(dislike => (dislike && dislike.toString()) === user_id)

        console.log(`[LIKE] Question ${id} current state:`, {
            user_id,
            userObjectId: userObjectId.toString(),
            alreadyLiked,
            alreadyDisliked,
            likes_count: question.likes_count,
            dislikes_count: question.dislikes_count,
            total_likes: question.likes.length,
            total_dislikes: question.dislikes.length,
            likes_array: question.likes.map(like => like.toString()),
            dislikes_array: question.dislikes.map(dislike => dislike.toString())
        })

        // Build atomic update to avoid race conditions and duplicate entries
        let updateQuery = {}

        if (alreadyLiked) {
            // Toggle off like
            console.log(`[LIKE] User ${user_id} removing like from question ${id}`)
            updateQuery = {
                $pull: { likes: userObjectId },
                $inc: { likes_count: -1 }
            }
        } else {
            // Add like; if user had a dislike, remove it in the same atomic operation
            if (alreadyDisliked) {
                console.log(`[LIKE] User ${user_id} switching from dislike to like for question ${id}`)
                updateQuery = {
                    $pull: { dislikes: userObjectId },
                    $addToSet: { likes: userObjectId },
                    $inc: { likes_count: 1, dislikes_count: -1 }
                }
            } else {
                console.log(`[LIKE] User ${user_id} adding new like to question ${id}`)
                updateQuery = {
                    $addToSet: { likes: userObjectId }, // addToSet prevents duplicates
                    $inc: { likes_count: 1 }
                }
            }
        }

        console.log(`[LIKE] Executing update for question ${id}:`, updateQuery)

        const updatedQuestion = await ForumQuestion.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        ).select('likes_count dislikes_count')

        console.log(`[LIKE] Update result for question ${id}:`, {
            likes_count: updatedQuestion.likes_count,
            dislikes_count: updatedQuestion.dislikes_count
        })

        // Get fresh question and normalize likes/dislikes to ObjectId array entries
        let freshQuestion = await ForumQuestion.findById(id).lean()

        const normLikes = toValidObjectIdArray(freshQuestion.likes)
        const normDislikes = toValidObjectIdArray(freshQuestion.dislikes)

        // Ensure a user cannot be in both sets; remove from dislikes if present in likes
        const likesSet = new Set(normLikes.map(l => l.toString()))
        const dislikesSet = new Set(normDislikes.map(d => d.toString()))
        for (let idStr of Array.from(likesSet)) {
            if (dislikesSet.has(idStr)) {
                dislikesSet.delete(idStr)
            }
        }

        const finalLikes = Array.from(likesSet).map(s => new mongoose.Types.ObjectId(s))
        const finalDislikes = Array.from(dislikesSet).map(s => new mongoose.Types.ObjectId(s))

        // Update document with normalized arrays and correct counts (use final arrays)
        const normalized = await ForumQuestion.findByIdAndUpdate(id, {
            likes: finalLikes,
            dislikes: finalDislikes,
            likes_count: finalLikes.length,
            dislikes_count: finalDislikes.length
        }, { new: true }).lean()

        freshQuestion = normalized
        const userLiked = (freshQuestion.likes || []).some(l => l.toString() === user_id)
        const userDisliked = (freshQuestion.dislikes || []).some(d => d.toString() === user_id)

        console.log(`[LIKE] Final normalized state for user ${user_id} on question ${id}:`, {
            userLiked,
            userDisliked,
            final_likes_count: freshQuestion.likes_count,
            final_dislikes_count: freshQuestion.dislikes_count,
            actual_likes_length: freshQuestion.likes.length,
            actual_dislikes_length: freshQuestion.dislikes.length,
            fresh_likes_array: freshQuestion.likes.map(like => like.toString()),
            fresh_dislikes_array: freshQuestion.dislikes.map(dislike => dislike.toString())
        })

        res.status(200).json({
            success: true,
            message: alreadyLiked ? "Like removed" : "Question liked",
            data: {
                likes_count: freshQuestion.likes_count,
                dislikes_count: freshQuestion.dislikes_count,
                user_liked: userLiked,
                user_disliked: userDisliked
            }
        })
    } catch (error) {
        // Log full stack for debugging
        console.error(`[LIKE] Error for user ${req.user?.user_id} on question ${req.params.id}:`, error)
        console.error(error.stack)
        const payload = {
            success: false,
            message: "Server error while liking question",
            error: error.message
        }
        if (process.env.NODE_ENV !== 'production') {
            payload.stack = error.stack
        }
        res.status(500).json(payload)
    }
}

// @desc Dislike forum question
// @route POST /api/forum/questions/:id/dislike
// @access Private
const dislikeForumQuestion = async (req, res) => {
    try {
        const { id } = req.params
        const user_id = req.user?.user_id

        console.log(`[DISLIKE] User ${user_id} attempting to dislike question ${id}`)

        if (!user_id) {
            console.log(`[DISLIKE] Authentication failed for question ${id}`)
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            })
        }

        const question = await ForumQuestion.findById(id)
        if (!question) {
            console.log(`[DISLIKE] Question ${id} not found`)
            return res.status(404).json({
                success: false,
                message: "Forum question not found"
            })
        }

        // Check current user status - convert user_id to ObjectId for proper comparison
        const userObjectId = new mongoose.Types.ObjectId(user_id)
        const alreadyLiked = question.likes.some(like => (like && like.toString()) === user_id)
        const alreadyDisliked = question.dislikes.some(dislike => (dislike && dislike.toString()) === user_id)

        console.log(`[DISLIKE] Question ${id} current state:`, {
            user_id,
            userObjectId: userObjectId.toString(),
            alreadyLiked,
            alreadyDisliked,
            likes_count: question.likes_count,
            dislikes_count: question.dislikes_count,
            total_likes: question.likes.length,
            total_dislikes: question.dislikes.length,
            likes_array: question.likes.map(like => like.toString()),
            dislikes_array: question.dislikes.map(dislike => dislike.toString())
        })

        // Build atomic update to avoid race conditions and duplicate entries
        let updateQuery = {}

        if (alreadyDisliked) {
            // Toggle off dislike
            console.log(`[DISLIKE] User ${user_id} removing dislike from question ${id}`)
            updateQuery = {
                $pull: { dislikes: userObjectId },
                $inc: { dislikes_count: -1 }
            }
        } else {
            // Add dislike; if user had a like, remove it in the same atomic operation
            if (alreadyLiked) {
                console.log(`[DISLIKE] User ${user_id} switching from like to dislike for question ${id}`)
                updateQuery = {
                    $pull: { likes: userObjectId },
                    $addToSet: { dislikes: userObjectId },
                    $inc: { dislikes_count: 1, likes_count: -1 }
                }
            } else {
                console.log(`[DISLIKE] User ${user_id} adding new dislike to question ${id}`)
                updateQuery = {
                    $addToSet: { dislikes: userObjectId }, // addToSet prevents duplicates
                    $inc: { dislikes_count: 1 }
                }
            }
        }

        console.log(`[DISLIKE] Executing update for question ${id}:`, updateQuery)

        const updatedQuestion = await ForumQuestion.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        ).select('likes_count dislikes_count')

        console.log(`[DISLIKE] Update result for question ${id}:`, {
            likes_count: updatedQuestion.likes_count,
            dislikes_count: updatedQuestion.dislikes_count
        })

        // Get fresh question and normalize likes/dislikes to ObjectId array entries
        let freshQuestion = await ForumQuestion.findById(id).lean()

        // Normalize helper: extract user id string whether element is ObjectId or subdoc
        const extractId = (elem) => {
            if (!elem) return null
            if (elem.user) return elem.user.toString()
            return elem.toString()
        }

        const normLikes = toValidObjectIdArray(freshQuestion.likes)
        const normDislikes = toValidObjectIdArray(freshQuestion.dislikes)

        // Ensure a user cannot be in both sets; remove from likes if present in dislikes (dislike wins here)
        const likesSet2 = new Set(normLikes.map(l => l.toString()))
        const dislikesSet2 = new Set(normDislikes.map(d => d.toString()))
        for (let idStr of Array.from(dislikesSet2)) {
            if (likesSet2.has(idStr)) {
                likesSet2.delete(idStr)
            }
        }

        const finalLikes2 = Array.from(likesSet2).map(s => new mongoose.Types.ObjectId(s))
        const finalDislikes2 = Array.from(dislikesSet2).map(s => new mongoose.Types.ObjectId(s))

        // Update document with normalized arrays and correct counts
        const normalized = await ForumQuestion.findByIdAndUpdate(id, {
            likes: finalLikes2,
            dislikes: finalDislikes2,
            likes_count: finalLikes2.length,
            dislikes_count: finalDislikes2.length
        }, { new: true }).lean()

        freshQuestion = normalized
        const userLiked = (freshQuestion.likes || []).some(l => l.toString() === user_id)
        const userDisliked = (freshQuestion.dislikes || []).some(d => d.toString() === user_id)

        console.log(`[DISLIKE] Final normalized state for user ${user_id} on question ${id}:`, {
            userLiked,
            userDisliked,
            final_likes_count: freshQuestion.likes_count,
            final_dislikes_count: freshQuestion.dislikes_count,
            actual_likes_length: freshQuestion.likes.length,
            actual_dislikes_length: freshQuestion.dislikes.length,
            fresh_likes_array: freshQuestion.likes.map(like => like.toString()),
            fresh_dislikes_array: freshQuestion.dislikes.map(dislike => dislike.toString())
        })

        res.status(200).json({
            success: true,
            message: alreadyDisliked ? "Dislike removed" : "Question disliked",
            data: {
                likes_count: freshQuestion.likes_count,
                dislikes_count: freshQuestion.dislikes_count,
                user_liked: userLiked,
                user_disliked: userDisliked
            }
        })
    } catch (error) {
        console.error(`[DISLIKE] Error for user ${req.user?.user_id} on question ${req.params.id}:`, error)
        res.status(500).json({
            success: false,
            message: "Server error while disliking question",
            error: error.message
        })
    }
}

// @desc Like comment
// @route POST /api/forum/comments/:id/like
// @desc Like comment  
// @route POST /api/forum/comments/:id/like
// @access Private
const likeComment = async (req, res) => {
    try {
        const { id } = req.params
        const user_id = req.user?.user_id

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            })
        }

        const comment = await Comment.findById(id)
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            })
        }

        // Use string comparison for robustness
        const userObjectId = new mongoose.Types.ObjectId(user_id)
        const alreadyLiked = comment.likes.some(like => (like && like.toString()) === user_id)
        const alreadyDisliked = comment.dislikes.some(dislike => (dislike && dislike.toString()) === user_id)

        // Build atomic update
        let updateQuery = {}

        if (alreadyLiked) {
            // Toggle off like
            updateQuery = {
                $pull: { likes: userObjectId },
                $inc: { likes_count: -1 }
            }
        } else {
            if (alreadyDisliked) {
                // Switch dislike -> like in one op
                updateQuery = {
                    $pull: { dislikes: userObjectId },
                    $addToSet: { likes: userObjectId },
                    $inc: { likes_count: 1, dislikes_count: -1 }
                }
            } else {
                updateQuery = {
                    $addToSet: { likes: userObjectId },
                    $inc: { likes_count: 1 }
                }
            }
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        ).select('likes_count dislikes_count')

        // Get fresh comment and normalize likes/dislikes
        let freshComment = await Comment.findById(id).lean()

        const extractId = (elem) => {
            if (!elem) return null
            if (elem.user) return elem.user.toString()
            return elem.toString()
        }

        const normLikesC = toValidObjectIdArray(freshComment.likes)
        const normDislikesC = toValidObjectIdArray(freshComment.dislikes)

        // If user appears in both, remove from dislikes when switching to like
        const likesSetC = new Set(normLikesC.map(l => l.toString()))
        const dislikesSetC = new Set(normDislikesC.map(d => d.toString()))
        for (let idStr of Array.from(dislikesSetC)) {
            if (likesSetC.has(idStr)) {
                dislikesSetC.delete(idStr)
            }
        }

        const finalLikesC = Array.from(likesSetC).map(s => new mongoose.Types.ObjectId(s))
        const finalDislikesC = Array.from(dislikesSetC).map(s => new mongoose.Types.ObjectId(s))

        const normalized = await Comment.findByIdAndUpdate(id, {
            likes: finalLikesC,
            dislikes: finalDislikesC,
            likes_count: finalLikesC.length,
            dislikes_count: finalDislikesC.length
        }, { new: true }).lean()

        freshComment = normalized
        const userLiked = (freshComment.likes || []).some(l => l.toString() === user_id)
        const userDisliked = (freshComment.dislikes || []).some(d => d.toString() === user_id)

        res.status(200).json({
            success: true,
            message: alreadyLiked ? "Like removed" : "Comment liked",
            data: {
                likes_count: freshComment.likes_count,
                dislikes_count: freshComment.dislikes_count,
                user_liked: userLiked,
                user_disliked: userDisliked
            }
        })
    } catch (error) {
        console.error('Like comment error:', error)
        res.status(500).json({
            success: false,
            message: "Server error while liking comment",
            error: error.message
        })
    }
}

// @desc Dislike comment
// @route POST /api/forum/comments/:id/dislike
// @access Private
const dislikeComment = async (req, res) => {
    try {
        const { id } = req.params
        const user_id = req.user?.user_id

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            })
        }

        const comment = await Comment.findById(id)
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            })
        }

        // Check if user already disliked this comment - use proper ObjectId comparison
        // Use string comparison for robustness
        const userObjectId = new mongoose.Types.ObjectId(user_id)
        const alreadyLiked = comment.likes.some(like => (like && like.toString()) === user_id)
        const alreadyDisliked = comment.dislikes.some(dislike => (dislike && dislike.toString()) === user_id)

        // Build atomic update
        let updateQuery = {}

        if (alreadyDisliked) {
            // Toggle off dislike
            updateQuery = {
                $pull: { dislikes: userObjectId },
                $inc: { dislikes_count: -1 }
            }
        } else {
            if (alreadyLiked) {
                // Switch like -> dislike in one op
                updateQuery = {
                    $pull: { likes: userObjectId },
                    $addToSet: { dislikes: userObjectId },
                    $inc: { dislikes_count: 1, likes_count: -1 }
                }
            } else {
                updateQuery = {
                    $addToSet: { dislikes: userObjectId },
                    $inc: { dislikes_count: 1 }
                }
            }
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        ).select('likes_count dislikes_count')

        // Get fresh comment and normalize likes/dislikes
        let freshComment = await Comment.findById(id).lean()

        const extractId = (elem) => {
            if (!elem) return null
            if (elem.user) return elem.user.toString()
            return elem.toString()
        }

        const normLikesC2 = toValidObjectIdArray(freshComment.likes)
        const normDislikesC2 = toValidObjectIdArray(freshComment.dislikes)

        // If user appears in both, remove from likes when switching to dislike
        const likesSetC2 = new Set(normLikesC2.map(l => l.toString()))
        const dislikesSetC2 = new Set(normDislikesC2.map(d => d.toString()))
        for (let idStr of Array.from(likesSetC2)) {
            if (dislikesSetC2.has(idStr)) {
                likesSetC2.delete(idStr)
            }
        }

        const finalLikesC2 = Array.from(likesSetC2).map(s => new mongoose.Types.ObjectId(s))
        const finalDislikesC2 = Array.from(dislikesSetC2).map(s => new mongoose.Types.ObjectId(s))

        const normalized = await Comment.findByIdAndUpdate(id, {
            likes: finalLikesC2,
            dislikes: finalDislikesC2,
            likes_count: finalLikesC2.length,
            dislikes_count: finalDislikesC2.length
        }, { new: true }).lean()

        freshComment = normalized
        const userLiked = (freshComment.likes || []).some(l => l.toString() === user_id)
        const userDisliked = (freshComment.dislikes || []).some(d => d.toString() === user_id)

        res.status(200).json({
            success: true,
            message: alreadyDisliked ? "Dislike removed" : "Comment disliked",
            data: {
                likes_count: freshComment.likes_count,
                dislikes_count: freshComment.dislikes_count,
                user_liked: userLiked,
                user_disliked: userDisliked
            }
        })
    } catch (error) {
        console.error('Dislike comment error:', error)
        res.status(500).json({
            success: false,
            message: "Server error while disliking comment",
            error: error.message
        })
    }
}

module.exports = {
    getForumQuestions,
    getForumQuestion,
    createForumQuestion,
    addComment,
    likeForumQuestion,
    dislikeForumQuestion,
    likeComment,
    dislikeComment
}