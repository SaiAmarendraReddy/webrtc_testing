const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const PORT = 3456
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        method: ['GET', 'POST']
    }
});

io.on("connection", (socket) => {
    console.log(socket.id);

    //room Join
    socket.on('roomJoin', (roomId) => {
        let friend;
        //join in that room
        socket.join(roomId);
        console.log(`socket ID Room ${roomId}`);
        //get all the sockets (or) clients present in the particular room
        const clientsIDs = io.sockets.adapter.rooms.get(roomId);
        const noOfClients = io.sockets.adapter.rooms.get(roomId).size;
        console.log(`No.of clients present in that room ${noOfClients}`);
        console.log(`clients IDs `, clientsIDs)
        //if 2 clients or sockets present. then send the socketID of other person
        clientsIDs.forEach((value, index) => {
            console.log(value)
            if (socket.id !== value) {
                friend = value;
                //send another socketID to another peer
                socket.emit('friends', { noOfClients, friend })
            }
        });
        //send another socketID to another peer
        // io.to(roomId).emit('friends',{noOfClients,friend})

    })

    //receive the offer from one client and send it to another client
    //incoming formate offer {from,to,sdp}
    socket.on("offer", (offer) => {
        console.log(`offer from client " ${socket.id} " : ${JSON.stringify(offer)}`);
        //send the offer to another client
        socket.to(offer.to).emit('offer',offer);
        // io.emit('offer', offer);
    });

    //receive the answer from client and send it to another Client
    //incoming formate answer {from,to,sdp}
    socket.on("answer", (answer) => {
        console.log(`***** answer from client " ${socket.id} " : ${JSON.stringify(answer)}`)
        //send the answer to another client
        //socket.emit('answer', answer);
        socket.to(answer.to).emit('answer', answer);
    });

    //receive iceCandidate from client and send it to another client
    //incoming formate iceCandidate {from,to,sdp}
    socket.on("iceCandidate", (iceCandidate) => {
       console.log(`***** iceCandidate from client ${JSON.stringify(iceCandidate)}`);
       console.log(`***** iceCandidate to client`,iceCandidate.to);
        //send the iceCandidate to another client
        //socket.emit("iceCandidate", iceCandidate);
        socket.to(iceCandidate.to).emit("iceCandidate", iceCandidate);
    })

});

httpServer.listen(PORT, () => {
    console.log(`connection establish ${PORT}`)
});