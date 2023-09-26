const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const { Socket } = require('dgram');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set up MongoDB connection
mongoose.connect('mongodb+srv://xcoder:xcoder6767@vadodarahackthon.q7ncrkz.mongodb.net/vadodaraHackthon?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

/*--------------------------------------------------------------------------------------------------------------------------------------------------------
    Define Mongoose Schema for messages
--------------------------------------------------------------------------------------------------------------------------------------------------------*/
const messageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    content: String,
}, {
    timestamps: true,
});
const Message = mongoose.model('Messages', messageSchema);
/*-------------------------------------------------------------------------------------------------------------------------------------------------------*/



/*--------------------------------------------------------------------------------------------------------------------------------------------------------
    connection it with server and save it in database
--------------------------------------------------------------------------------------------------------------------------------------------------------*/
let onlineUsers = []

io.on("connection", (socket) => {

    console.log("backend is connected:", socket.id);


    //===add new user in list----------------------------------------------------------------------------------------
    socket.on("addNewUser", (userId) => {
        console.log("userId:", userId);
        onlineUsers.push({ userId, socketId: socket.id });
        console.log("onlineUsers:", onlineUsers);
        // io.emit("getOnlineUser", onlineUsers)
    })
    //--------------------------------------------------------------------------------------------------------------


    socket.on("sendMsg", async (msg) => {
        console.log("message is:", msg);

        //===store it in database----------------------------------------------------------------------------------------
        const { sender, receiver, content } = msg;
        const message = new Message({ sender, receiver, content });
        await message.save();
        //--------------------------------------------------------------------------------------------------------------


        //===get the socket.id from user-id--------------------------------------------------------------------------------
        const user = onlineUsers.find((user) => user.userId.generatedUuid === "4d5e0116-a1c2-4e57-8f57-c75d0fd8527f")
        console.log("receiver:", user);
        io.to(user.socketId).emit('sendMsgServer', { msg });
        //--------------------------------------------------------------------------------------------------------------

    })

    //===remove user from list when user is disconnected--------------------------------------------------------------------------------
    socket.on('disconnect', () => {
        console.log('User disconnected');
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    });
    //----------------------------------------------------------------------------------------------------------------

})

//--------server connection---------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//-----------------------------------------------------------------------------------------------------------------------