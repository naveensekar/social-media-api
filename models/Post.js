const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    title: String,
    html: String,
    excerpt: String,
    media: new mongoose.Schema({
        type: {
            type: String,
            enum: ['image', 'video']
        },
        path: String
    }),
    slug: String,
    points: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    },
    comments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    is_public: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Post', PostSchema)
