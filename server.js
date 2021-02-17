const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')

app.set('view engine', 'pug')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    var context = { roomId: req.params.room }
    res.render('room', context)
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)
    })

    socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
})

server.listen(2000)