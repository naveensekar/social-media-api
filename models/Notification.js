const mongoose = require('mongoose')

module.exports = mongoose.model('Notification', new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    is_read: {
        type: Boolean,
        default: false
    },
    url: {
        type: String,
        default: '/'
    }
},
    {
        timestamps: true
    }))