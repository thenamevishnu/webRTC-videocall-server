
import express from "express"
import { Server } from "socket.io"
import cors from "cors"

const app = express()

app.use(cors())

const server = app.listen(process.env.PORT || 8081, () => {
    console.log(`Server running on port ${process.env.PORT || 8081}`)
})

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        methods: "*"
    }
})

io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("join_room", (data) => {
        socket.join(data.room_id)
        socket.to(data.room_id).emit("user_connected", data)
    })

    socket.on("sendMessageToPeer",(data) =>{
        socket.to(data.room_id).emit("receivedPeerToPeer",data)
    })

    socket.on("end_call", data => {
        socket.to(data.room_id).emit("call_ended", data)
    })

    socket.on("update_video", data => {
        socket.to(data.room_id).emit("video_updated", data)
    })

})