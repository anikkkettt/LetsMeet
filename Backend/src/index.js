const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes= require('./routes/userrouter.js')
const { connectToSocket } = require('./controllers/socketManager.js');


const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.use(cors());
app.use(express.json({ limit: '128kb' }));
app.use(express.urlencoded({ extended: true , limit: '128kb'}));
app.use("/api/users/", userRoutes)


app.get('/', (req, res) => {
    res.send('Hello World');
});

const startServer = async () => {
    const connection = await mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASS}@letsmeet.wapbb.mongodb.net/`);
    console.log(`MongoDB connected to ${connection.connection.host}`);
    server.listen(8000, () => {
        console.log('Server is running on port 8000');
    });
};


startServer();

