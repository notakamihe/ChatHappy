const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    createdat: {
        type: Date,
        required: true,
        default: Date.now
    },
    sentby: {
        type: mongoose.mongo.ObjectID,
        required: true
    },
})

module.exports = mongoose.model('Message', messageSchema)