const express = require('express')
const router = express.Router()
const {
    getForumQuestions,
    getForumQuestion,
    createForumQuestion,
    addComment
} = require('../controllers/forumController')
const verifyToken = require('../middlewares/auth')

// All routes require authentication
router.use(verifyToken)

// Forum question routes
router.route('/questions')
    .get(getForumQuestions)
    .post(createForumQuestion)

router.route('/questions/:id')
    .get(getForumQuestion)

router.route('/questions/:id/comments')
    .post(addComment)

module.exports = router