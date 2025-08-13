const Comment = require('../models/CommentModel');
const Offer = require('../models/OfferModel');

const addComment = async (req, res) => {
    try {
        const { offerId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const comment = new Comment({
            offer: offerId,
            author : userId,
            content
        });
        await comment.save();
        await Offer.findByIdAndUpdate(offerId, { $push: { comments: comment._id } });
        res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (err) {
        res.status(500).json({ message: 'Error adding comment', error: err.message });
    }
}
const getCommentsByOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const comments = await Comment.find({ offer: offerId })
            .populate('author', 'fullname') // Populate author field with username
            .sort({ date: -1 }); // Sort comments by date in descending order
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving comments', error: err.message });
    }
}

const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (req.user.role !== 'admin' && comment.author.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own comments or if you are an admin' });
        }
        // Supprimer le commentaire
        await Comment.findByIdAndDelete(commentId);
        // Retirer la référence dans l'offre
        await Offer.findByIdAndUpdate(comment.offer, { $pull: { comments: comment._id } });
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting comment', error: err.message });
    }
}


module.exports = {
    addComment,
    getCommentsByOffer,
    deleteComment
};