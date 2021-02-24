const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const User = require('../models/user')
const Conversation = require('../models/conversation')
const Message = require('../models/message')

router.get("/users", async (req, res) => {
    try {
        res.send(await getUsers())
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

const getUsers = async () => {
    const users = await User.find()
    return users
}

router.get("/users/:id", getUser, (req, res) => {
    res.json(res.user)
})

router.post("/signup", async (req, res) => {
    var password = req.body.password;
    var user;

    if (req.body.username == null || req.body.username == "") {
        return res.status(400).send("Name cannot be blank")
    }
    
    if (req.body.email == null || req.body.email == "") {
        return res.status(400).send("Email cannot be blank")
    }

    if (req.body.dob == null || req.body.dob == "") {
        return res.status(400).send("Dob cannot be blank")
    } else if (!req.body.dob.match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])*/ )) {
        return res.status(400).send("Dob not in correct format (YYYY-MM-DD)")
    }

    if (password == null || password == "") {
        return res.status(400).send("Password cannot be blank")
    } else if (password.length < 8) {
        return res.status(400).send("Password too short. Min length is 8")
    }

    if (req.body.friends == null) {
        return res.status(400).send("List of friends cannot be blank")
    }

    bcrypt.genSalt(10, async function (err, salt) {
        if (err) {
            throw err
        } else {
            bcrypt.hash(password, salt, async function(err, hash) {
                if (err) {
                    throw err
                } else {
                    user = new User({
                        username: req.body.username,
                        email: req.body.email,
                        dob: req.body.dob,
                        password: hash,
                        friends: []
                    })

                    try {
                        const newUser = await user.save()
                        res.status(201).json(newUser)
                    } catch (err) {
                        if (err.message.toString().includes("username_1")) {
                            return res.status(400).send("Username not available.")
                        }
                
                        if (err.message.toString().includes("email_1")) {
                            return res.status(400).send("Email not available.")
                        }
                
                        res.status(400).send({ message: err.message })
                    }
                }
            })
        }
    })
})

router.post("/login", async (req, res) => {
    if (req.body.username == null || req.body.username == "") {
        return res.status(400).send("Name cannot be blank")
    }

    if (req.body.password == null || req.body.password == "") {
        return res.status(400).send("Password cannot be blank")
    }

    try {
        User.findOne({username: req.body.username}).exec(function (err, user) {
            if (user == null) {
                return res.status(400).send("User could not be found")
            } else {
                bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
                    if (err) {
                        throw err
                    } else if (!isMatch) {
                        return res.status(401).send("Invalid password")
                    } else {
                        return res.json(user)
                    }
                })
            }
        })
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

router.put("/users/:id", getUser, async (req, res) => {
    try {
        if (req.body.username == null || req.body.username == "") {
            return res.status(400).send("Name cannot be blank")
        }
        
        if (req.body.email == null || req.body.email == "") {
            return res.status(400).send("Email cannot be blank")
        }

        if (req.body.dob == null || req.body.dob == "") {
            return res.status(400).send("Dob cannot be blank")
        } else if (!req.body.dob.match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])*/ )) {
            return res.status(400).send("Dob not in correct format (YYYY-MM-DD)")
        }

        if (req.body.friends == null) {
            return res.status(400).send("List of friends cannot be blank")
        }

        res.user.username = req.body.username
        res.user.email = req.body.email
        res.user.dob = req.body.dob
        res.user.friends = req.body.friends

        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        if (err.message.toString().includes("username_1")) {
            return res.status(400).send("Username not available.")
        }

        if (err.message.toString().includes("email_1")) {
            return res.status(400).send("Email not available.")
        }

        res.status(400).send({ message: err.message })
    }
})

router.delete("/users/:id", getUser, async (req, res) => {
    try {
        await res.user.remove()
        res.json('Deleted user')
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find()
        res.send(messages)
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

router.get("/messages/:id", getMessage, async (req, res) => {
    res.json(res.message)
})

router.post("/messages", async (req, res) => {
    if (req.body.content == null || req.body.content == "") {
        return res.status(400).send("Content cannot be blank")
    }
    
    if (req.body.sentby == null) {
        return res.status(400).send("Sender cannot be null")
    } else {
        const ids = (await getUsers()).map(user => user._id.toString())

        if (!ids.includes(req.body.sentby)) {
            return res.status(400).send("Sender not found")
        }
    }

    const message = new Message({
        content: req.body.content,
        sentby: req.body.sentby
    })

    try {
        const newMessage = await message.save()
        res.status(201).json(newMessage)
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
})

router.put("/messages/:id", getMessage, async (req, res) => {
    if (req.body.content == null || req.body.content == "") {
        return res.status(400).send("Content cannot be blank")
    }
    
    if (req.body.sentby == null) {
        return res.status(400).send("Sender cannot be null")
    } else {
        const ids = (await getUsers()).map(user => user._id.toString())

        if (!ids.includes(req.body.sentby)) {
            return res.status(400).send("Sender not found")
        }
    }

    res.message.content = req.body.content
    res.message.sentby = req.body.sentby

    try {
        const updatedMessage = await res.message.save()
        res.status(201).json(updatedMessage)
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
})

router.delete("/messages/:id", getMessage, async (req, res) => {
    try {
        await res.message.remove()
        res.json('Deleted message')
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get("/conversations", async (req, res) => {
    try {
        const conversations = await Conversation.find()
        res.send(conversations)
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

router.get("/conversations/:id", getConversation, async (req, res) => {
    res.json(res.conversation)
})

router.post("/conversations", async (req, res) => {
    if (req.body.messages == null) {
        return res.status(400).send("List of messages cannot be null")
    }
    
    if (req.body.users == null) {
        return res.status(400).send("List of users cannot be null")
    } else if (req.body.users.length < 2) {
        return res.status(400).send("At least 2 users required")
    } else {
        const ids = (await getUsers()).map(user => user._id.toString())

        if (req.body.users.some(id => !ids.includes(id))) {
            return res.status(400).send("User not found")
        }
    }

    const conversation = new Conversation({
        messages: req.body.messages,
        users: req.body.users
    })

    try {
        const newConversation = await conversation.save()
        res.status(201).json(newConversation)
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
})

router.put("/conversations/:id", getConversation, async (req, res) => {
    if (req.body.messages == null) {
        return res.status(400).send("List of messages cannot be null")
    }
    
    if (req.body.users == null) {
        return res.status(400).send("List of users cannot be null")
    } else if (req.body.users.length < 2) {
        return res.status(400).send("At least 2 users required")
    } else {
        const ids = (await getUsers()).map(user => user._id.toString())

        if (req.body.users.some(id => !ids.includes(id))) {
            return res.status(400).send("User not found")
        }
    }

    res.conversation.messages = req.body.messages
    res.conversation.users = req.body.users

    try {
        const updatedConversation = await res.conversation.save()
        res.status(201).json(updatedConversation)
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
})

router.delete("/conversations/:id", getConversation, async (req, res) => {
    try {
        await res.conversation.remove()
        res.json('Deleted conversation')
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

async function getUser (req, res, next) {
    let user

    try {
        user = await User.findById(req.params.id)

        if (user == null) {
            return res.status(400).json({ message: "Cannot find user" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.user = user
    next()
}

async function getConversation (req, res, next) {
    let conversation

    try {
        conversation = await Conversation.findById(req.params.id)

        if (conversation == null) {
            return res.status(400).json({ message: "Cannot find conversation" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.conversation = conversation
    next()
}

async function getMessage (req, res, next) {
    let message

    try {
        message = await Message.findById(req.params.id)

        if (message == null) {
            return res.status(400).json({ message: "Cannot find message" })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.message = message
    next()
}

module.exports = router