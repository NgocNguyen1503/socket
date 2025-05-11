// npm init
// npm install express socket.io
const express = require("express");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  // Allow all domains to call here.
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true
  },

  // Definition of connection protocol
  transports: ["websocket", "polling", "flashsocket"], // polling: for game
  // Set up auto-reconnect when client and server are interrupted.
  // The default reconnect timeout is 2000ms.
  reconnection: false,
  // Define headers for information returned to clients
  handlePreflightRequest: (req, res) => {
    // If successful, headers will be defined here.
    res.writeHead(200, {
        // Accept all http, https
        "Access-Control-Allow-Origin": "*",
        // Accept method
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        // Access all type header
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        // Access none credentials
        "Access-Control-Allow-Credentials": "true",
    });
    res.end();
  },
  // This path will be located after the domain to determine the correct socket server.
  path: "/socket.io",
});
// Initiate a new connection when there is an account connected to the server socket
io.on("connection", (socket) => {
  console.log("1 user connected");
  // Listen for events when an account sends data to the server socket
  socket.on("ClientSendMessageToServer", (requestData) => {
    // Define room name
    let roomName = "";
    if (requestData.type == "comment") {
      roomName = "room_" + requestData.post_id;
    } 
    if (requestData.type == "message") {
      roomName = "room_" + requestData.roomId;
    }
    switch (requestData.type) {
      case "join":
        /**
         * Join a room, room name send from client
         * Rooms in Socket.IO don't need to be created, one is created when a socket joins it.
         * They are joined on the server side, so you would have to instruct the server using the client.
         */
        socket.join(roomName);
        break;
      case "leave":
        /**
         * Client leave the room
         * Client who leave a room will no longer receive notifications from this room.
         */
        socket.leave(roomName);
        break;
      case "send-message":
        /**
         * You don't need to store this room object anywhere, because it's already part of the io object.
         * You can then treat the room like its own socket instance.
         * Proceed to send information to all users listening in room
         */
        io.in(roomName).emit("ServerSendMessageToClient", requestData);
        break;
      case "send-comment":
        /**
         * You don't need to store this room object anywhere, because it's already part of the io object.
         * You can then treat the room like its own socket instance.
         * Proceed to send information to all users listening in room
         */
        io.in(roomName).emit("ServerSendMessageToClient", requestData);
        break;
      default:
        break;
    }
  });
  // Disconnect the user
  socket.on("disconnect", (socket) => {
    console.log("a user disconnected");
  });
});
// Init port listen
let listenPort = 3000;
// Run the server socket using: node <server_name>.js
server.listen(listenPort, (evt) => {
  console.log("Server is running, listen port: " + listenPort);
});