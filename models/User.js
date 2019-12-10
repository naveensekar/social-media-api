const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    liked_posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    disliked_posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

userSchema.methods.generateToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT)
}

module.exports = mongoose.model('User', userSchema)
