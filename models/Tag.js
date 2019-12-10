const mongoose = require('mongoose')

module.exports = mongoose.model('Tag', new mongoose.Schema({
    name: String
}, {
    timestamps: true
}))
