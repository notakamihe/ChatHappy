const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
    messages: {
        type: [mongoose.mongo.ObjectID],
        required: true,
        default: []
    },
    users: {
        type: [mongoose.mongo.ObjectID],
        required: true
    },
})

module.exports = mongoose.model('Conversation', conversationSchema)