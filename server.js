const express = require('express');
const http = require('http');
const path = require('path');
const app= express();
const server = http.createServer(app);
const PORT = 3000;
const socketio = require('socket.io');
const io = socketio(server);
const formatMessage = require('./util/messages');
const {userJoin,getCurrentUser,userleave,getRoomUsers}=require('./util/users');
app.use(express.static(path.join(__dirname, 'public')));
const botname = "Chatemon";
io.on('connection',socket=>{
    console.log("New connection established.");
    socket.emit('message',formatMessage(botname,'Welcome to Chatemon'));

    socket.on('joinroom',({username,room})=>{
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
        socket.broadcast.to(user.room).emit('message',formatMessage(botname,`${username} has joined the chat.`));
        
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users: getRoomUsers(room)
        });

        socket.on('chatMessage',msg=>{
            const user = getCurrentUser(socket.id);
            io.to(user.room).emit('message',formatMessage( user.username,msg));
          })
    })

    
    socket.on('disconnect',()=>{
        const user = userleave(socket.id);

        if(user){
            io.emit('message',formatMessage(botname,`${user.username} has left the chat.`));  
        }

       
        
    })

  
})

server.listen(PORT,()=>console.log(`Server running at port ${PORT}`));
