
const express = require('express');

const router = express.Router();
const CommentController = require('../controller/CommentController');
const auth = require('../middleware/Auth');
const authorize = require('../middleware/authorize');

router.post('/createComment/:offerId', auth, authorize('candidate'), CommentController.addComment); // Endpoint to create a comment on an offer
router.get('/comments/:offerId', CommentController.getCommentsByOffer);
router.delete('/deleteComment/:id', auth, authorize('candidate', 'company'), CommentController.deleteComment); // Endpoint to delete a comment

module.exports = router;