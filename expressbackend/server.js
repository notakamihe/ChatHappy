require('dotenv').config()

const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require('cors')

mongoose.connect( process.env.ATLAS_URI || 'mongodb://localhost/chatdb', {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
const PORT = process.env.PORT || 3000

db.on('error', (error) => console.error(error))
db.once('open', () => console.log("Connected to database"))

app.use(cors())
app.use(express.json())

const router = require('./routes/routes')
app.use('/', router)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
