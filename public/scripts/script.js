const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer({
    config: {
        'iceServers': [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'stun:stun2.l.google.com:19302' }
        ]
    } /* Sample servers, please use appropriate ones */
})
// const myPeer = new Peer(undefined, {
//     secure: true, 
//     host: 'simple-vc-webrtc.herokuapp.com',
//     port: 1443,
// })
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            console.log('answer stream')
            addVideoStream(video, userVideoStream)
        })
        call.on('close', () => {
            console.log('callee side: call closed');
            video.remove()
        })
        call.on('error', err => {
            console.log('the call error');
        })
        console.log('idCaller: ',call.peer)
        peers[call.peer] = call
    })

    socket.on('user-connected', userId => {
        console.log('User Connected: ', userId)
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    console.log('User Disconnected', userId)
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)

    /**
     * Missing:
     *    when joining a room as not the first callee (as the 2nd or greater), 
     *    it doesn't have the callers peer of the other peers those joined 
     *    before it, so when any call of previous peer closes, its video get frozen. So for the solution, do some iteration for adding 
     *    every peers in the room
     */
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        console.log('caller side: call closed');
        video.remove()
    })
    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = "\o/";

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage;                            //Webkit, Safari, Chrome
});