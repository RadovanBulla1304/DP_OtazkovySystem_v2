const express = require('express')
const router = express.Router()
const {
    getForumQuestions,
    getForumQuestion,
    createForumQuestion,
    addComment,
    likeForumQuestion,
    dislikeForumQuestion,
    likeComment,
    dislikeComment,
    getForumTags
} = require('../controllers/forumController')

// Forum question routes
router.route('/questions')
    .get(getForumQuestions)
    .post(createForumQuestion)

router.route('/questions/:id')
    .get(getForumQuestion)

router.route('/questions/:id/comments')
    .post(addComment)

// Like/dislike routes for questions
router.route('/questions/:id/like')
    .post(likeForumQuestion)

router.route('/questions/:id/dislike')
    .post(dislikeForumQuestion)

// Like/dislike routes for comments
router.route('/comments/:id/like')
    .post(likeComment)

router.route('/comments/:id/dislike')
    .post(dislikeComment)

// Tags route
router.route('/tags')
    .get(getForumTags)

module.exports = router