const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    friends: {
        type: [mongoose.mongo.ObjectID],
        required: true,
        default: []
    },
    isDarkModeOn: {
        type: Boolean,
        default: true,
        required: true
    },
    imageUrl: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model('User', userSchema)