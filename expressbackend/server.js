require('dotenv').config()


const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const mongoose = require("mongoose")
const cors = require('cors')

const Message = require("./models/message")
const Conversation = require("./models/conversation")

mongoose.connect( process.env.ATLAS_URI || 'mongodb://localhost/chatdb', {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
const PORT = process.env.PORT || 8000

db.on('error', (error) => console.error(error))
db.once('open', () => console.log("Connected to database"))

app.use('/uploads', express.static('uploads'))
app.use(cors())
app.use(express.json())

const router = require('./routes/routes');
const { getMessageByIdWUserInfo } = require('./utils');
app.use('/', router)

io.on("connection", socket => {
    console.log("User connected.");

    socket.on("message", async (conversationId, message) => {
        const theConversation = await Conversation.findById(conversationId)

        const newMsg = new Message({content: message.content, sentby: message.sentby})
        await newMsg.save()

        theConversation.messages.push(newMsg._id)
        await theConversation.save()

        const msgWUserInfo = await getMessageByIdWUserInfo(newMsg._id)

        io.to(conversationId).emit("messageSent", conversationId, msgWUserInfo.sentby)
    });

    socket.on("joinRoom", (conversationId, user) => {
        console.log(user.username + " joined room " + conversationId);
    
        socket.join(conversationId)
    })

    socket.on("leaveRoom", (conversationId, user) => {
        console.log(user.username + " left");
    
        socket.leave(conversationId)
    })
})

http.listen(8000, () => console.log(`Server started on port ${PORT}`))
