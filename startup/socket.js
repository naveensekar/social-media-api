let users = {}
const count = () => console.log('Users Online: ' + Object.keys(users).length)

module.exports.io = http => {
    const io = require('socket.io')(http, {
        path: "/notifications",
        serveClient: false,
        pingInterval: 25000,
        pingTimeout: 60000,
        cookie: false
    })

    io.on('connection', socket => {
        let u
        socket.on('setuser', user => {
            users[user] = socket
            u = user
            count()
        })
    
        socket.on('disconnect', () => {
            delete users[u]
            count()
        })
    })
}

module.exports.users = users
