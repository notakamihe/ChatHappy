const Message = require("./models/message")
const User = require("./models/user")

const getMessageByIdWUserInfo = async (id) => {
    let message = (await Message.findById(id)).toObject()
    message.sentby = await User.findById(message.sentby)
    return message
}

module.exports.getMessageByIdWUserInfo = getMessageByIdWUserInfo