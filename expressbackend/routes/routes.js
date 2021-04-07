const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const multer = require("multer")
const jwt = require("jsonwebtoken")

const User = require('../models/user')
const Conversation = require('../models/conversation')
const Message = require('../models/message')
const { getMessageByIdWUserInfo } = require('../utils')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('image')) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
})

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

const getUserWDetails = async (id) => {
    const user = (await User.findById(id))

    await Promise.all(await user.friends.map(async (f, idx) => {
        const friend = await User.findById(f)
        user.friends[idx] = friend
    }))

    return user
}

router.post("/signup", async (req, res) => {
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

    if (req.body.password == null || req.body.password == "") {
        return res.status(400).send("Password cannot be blank")
    } else if (req.body.password.length < 8) {
        return res.status(400).send("Password too short. Min length is 8")
    }

    if (req.body.friends == null) {
        return res.status(400).send("List of friends cannot be blank")
    }

    var hashedPassword = bcrypt.hashSync(req.body.password, 8)

    const payload = {
        username: req.body.username,
        email: req.body.email,
        dob: req.body.dob,
        password: hashedPassword,
        friends: []
    }

    User.collection.insertOne(payload).then(result => {
        var token = jwt.sign({ id: result.ops[0]._id }, process.env.secret, {
            expiresIn: 86400
        });

        return res.status(201).json({ token: token });
    }).catch(err => {
        if (err.keyPattern && err.keyPattern.email)
            return res.status(400).send("Email not available.")

        if (err.keyPattern && err.keyPattern.username)
            return res.status(400).send("Username not available.")

        return res.status(500).send(err.message)
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
        const userByName = await User.findOne({username: req.body.username})
        
        if (!userByName)
            return res.status(400).send("User is not found")

        if (!bcrypt.compareSync(req.body.password, userByName.password))
            return res.status(401).send("Invalid password")

        var token = jwt.sign({ id: userByName._id }, process.env.secret, {
            expiresIn: 86400
        });

        return res.status(201).json({ token: token });
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

router.get("/user", async (req, res) => {
    var token = req.headers["x-access-token"]

    if (!token)
        return res.status(401).send({ message: "No token provided."})

    jwt.verify(token, process.env.secret, (err, decoded) => {
        if (err)
            return res.status(401).send({ message: "User not authenticated."})

        getUserWDetails(decoded.id).then(result => {
            return res.json(result)
        }).catch((err) => {
            return res.status(400).send("User not found.")
        })
    })
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
        } else {
            const ids = (await getUsers()).map(user => user._id.toString())

            if (req.body.friends.some(id => !ids.includes(id))) {
                return res.status(400).send("Friends array must be list of valid user OIDs")
            }
        }

        if (req.body.isDarkModeOn == null) {
            return res.status(400).send("Must specify dark mode status.")
        }

        res.user.username = req.body.username
        res.user.email = req.body.email
        res.user.dob = req.body.dob
        res.user.friends = req.body.friends
        res.user.isDarkModeOn = req.body.isDarkModeOn

        const updatedUser = await res.user.save()
        res.json(await getUserWDetails(updatedUser._id))
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

router.put("/users/:id/image", upload.single("image"), async (req, res) => {
    let user
    
    console.log("Updating image");

    try {
        user = await getUserWDetails(req.params.id)

        if (user == null) {
            return res.status(400).json({ message: "Cannot find user" })
        }

        user.imageUrl = req.file ? req.file.path.toString() : ""

        const updatedUser = await user.save()
        return res.json(user)
    } catch (err) {
        return res.status(500).json({ message: err.message })
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
        let conversations = await Conversation.find()

        for (let c of conversations) {
            await Promise.all(await c.users.map(async (u, idx) => {
                const user = await User.findById(u)
                c.users[idx] = user
            }))

            await Promise.all(await c.messages.map(async (m, idx) => {
                const message = await getMessageByIdWUserInfo(m)
                c.messages[idx] = message
            }))
        }

        res.send(conversations)
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
})

router.get("/conversations/:id", getConversation, async (req, res) => {
    await Promise.all(await res.conversation.users.map(async (u, idx) => {
        const user = await User.findById(u)
        res.conversation.users[idx] = user
    }))

    await Promise.all(await res.conversation.messages.map(async (m, idx) => {
        const message = await getMessageByIdWUserInfo(m)
        res.conversation.messages[idx] = message
    }))

    res.json(res.conversation)
})

router.post("/conversations", async (req, res) => {
    if (req.body.messages == null) {
        return res.status(400).send("List of messages cannot be null")
    } else {
        const ids = (await Message.find()).map(m => m._id.toString())

        if (req.body.messages.some(id => !ids.includes(id))) {
            return res.status(400).send("Messages array must be list of valid OIDs")
        }
    }
    
    if (req.body.users == null) {
        return res.status(400).send("List of users cannot be null")
    } else if (req.body.users.length < 2) {
        return res.status(400).send("At least 2 users required")
    } else {
        const ids = (await getUsers()).map(user => user._id.toString())

        if (req.body.users.some(id => !ids.includes(id))) {
            return res.status(400).send("Users array must be list of valid OIDs")
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
    } else {
        const ids = (await Message.find()).map(m => m._id.toString())

        if (req.body.messages.some(id => !ids.includes(id))) {
            return res.status(400).send("Messages array must be list of valid OIDs")
        }
    }
    
    if (req.body.users == null) {
        return res.status(400).send("List of users cannot be null")
    } else if (req.body.users.length < 2) {
        return res.status(400).send("At least 2 users required")
    } else {
        const ids = (await getUsers()).map(user => user._id.toString())

        if (req.body.users.some(id => !ids.includes(id))) {
            return res.status(400).send("Users array must be list of valid user OIDs")
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
        user = await getUserWDetails(req.params.id)

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
        message = await getMessageByIdWUserInfo(req.params.id)

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