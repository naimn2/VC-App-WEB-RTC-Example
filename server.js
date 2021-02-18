const express = require('express')
const app = express()
const server = require(process.env.npm_package_config_protocol).Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index', {title: 'VC WebRTC', welcome: 'Selamat Datang'})
})

app.get('/start', (req, res) => {
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

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(process.env.npm_package_config_port || 3000)