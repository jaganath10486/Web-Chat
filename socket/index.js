import express from "express";
import { createServer } from "http";

import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000'
    }
});

io.use((socket, next) => {
    // console.log("socket authentication : ", socket.handshake);
    next();
})

io.on('connection', (socket) => {
    console.log(`Socket id ${socket.id} is connected`);

    socket.on('Add User', (userId) => {
        socket.join(userId);
        console.log("User Joined Room", userId);
    })

    socket.on('Send Message', (message) => {
        if (!message.conversation.users) return console.log("No Users Found");
        // console.log(chat.users);
        console.log(message.conversation.users);
        message.conversation.users.forEach((user) => {
            if (user._id == message.senderId) return;
            socket.to(user._id).emit("Message Recieved", message);
        });

    })

    socket.on('Group Created', (group) => {
        if (!group.users) return console.log("No Users Found");
        console.log(group.users);
        group.users.forEach((user) => {
            if(user._id === group.groupAdmin._id) return;
            console.log("Emitted");
            socket.to(user._id).emit("New Group Created", group);
        });

    })

    socket.on('disconnect', () => {
        console.log("Socket Disconnected", socket.id);
    })

})

export { httpServer };