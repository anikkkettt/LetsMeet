
const { Server } = require("socket.io");


const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      })
      
      const rooms = new Map()
      
      io.on("connection", (socket) => {
        console.log("A user connected:", socket.id)
      
        socket.on("join-room", (roomId, userId) => {
          socket.join(roomId)
          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set())
          }
          rooms.get(roomId).add(userId)
          socket.to(roomId).emit("user-connected", userId)
      
          io.to(roomId).emit("participants-updated", Array.from(rooms.get(roomId)))
      
          // Set the first user as the active speaker
          if (rooms.get(roomId).size === 1) {
            io.to(roomId).emit("active-speaker", userId)
          }
      
          socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id)
            if (rooms.has(roomId)) {
              rooms.get(roomId).delete(userId)
              if (rooms.get(roomId).size === 0) {
                rooms.delete(roomId)
              } else {
                socket.to(roomId).emit("user-disconnected", userId)
                io.to(roomId).emit("participants-updated", Array.from(rooms.get(roomId)))
      
                // If the disconnected user was the active speaker, set a new one
                io.to(roomId).emit("active-speaker", Array.from(rooms.get(roomId))[0])
              }
            }
          })
        })
      
        socket.on("message", (roomId, message, sender) => {
          io.to(roomId).emit("message", message, sender)
        })
      
        socket.on("active-speaker", (roomId, userId) => {
          io.to(roomId).emit("active-speaker", userId)
        })
      })
      
};

module.exports = { connectToSocket };

