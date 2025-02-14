
import express from "express"
import { Server } from "socket.io"
import cors from "cors"
import cron from "node-cron"

const app = express()

app.use(cors())

app.get("/status", (req, res) => {
    return res.status(200).send("Server is running")
})

cron.schedule("* * * * *", async () => {
    try {
        const response = await fetch(`${process.env.SERVER}/status`)
        const res = await response.text()
        console.log(res)
    } catch (error) {
        console.log(error.message)
    }
})

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

    socket.on("max-user-connected", data => {
        socket.to(data.room_id).emit("max_user_reached", data)
    })

    socket.on("sendMessage", content => {
        socket.to(content.room_id).emit("receivedMessage", content)
    })

})