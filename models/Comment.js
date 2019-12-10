const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    text: String,
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    replies: [this],
    is_reply: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const populateReplies = function (next) {
    this
        .populate('replies', '-createdAt -updatedAt -__v -is_reply')
        .populate('author', 'username')
        .select('-createdAt -updatedAt -__v -is_reply')
        
    next()
}

commentSchema
    .pre('find', populateReplies)

module.exports = mongoose.model('Comment', commentSchema)
