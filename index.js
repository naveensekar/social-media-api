const express = require('express')
const app = express()
const http = require('http').createServer(app)
const { io, users } = require('./startup/socket')
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const auth = require('./routes/auth')
const tag = require('./routes/tag')
const post = require('./routes/post')
const comment = require('./routes/comment')
const notification = require('./routes/notification')

//connect to db
mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB connected successfully'))
    .catch(err => {
        console.log('DB Failed to connect!', err)
        process.exit(1)
    })

//check if jwt configed
if (!process.env.JWT) {
    console.log('JWT not configured!')
    process.exit(1)
}

//middlewares
app.use(cors())
app.use(express.json())
app.use(function (req, res, next) {
    req.io = io
    req.users = users
    req.notify = user => user in Object(req.users) && req.users[user].emit('notification')
    next()
})

//routes
app.use('/api/auth', auth)
app.use('/api/tags', tag)
app.use('/api/post', post)
app.use('/api/comment', comment)
app.use('/api/notification', notification)

//socket server
io(http)

//http server
const port = process.env.PORT || 4000
http.listen(port, () => console.log(`Server running on port ${port}`))
