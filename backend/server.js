const express = require("express");
const http = require("http");
const webSocket = require("ws");

const app = express();
const server = http.createServer(app);
const ws = new webSocket.Server({ server });
let users = [];
let drawings = [];
let messages = [];

ws.on("connection", (socket) => {
  socket.send(JSON.stringify({ action: "init", data: drawings }));
  socket.send(JSON.stringify({ action: "init_chat", data: messages }));
  socket.on("message", (m) => {
    const { action, data } = JSON.parse(m);
    const broadcast = (action, data) => {
      ws.clients.forEach((client) => {
        if (client.readyState === webSocket.OPEN) {
          client.send(JSON.stringify({ action, data }));
        }
      });
    };

    if (action === "draw") {
      drawings.push(data);
      broadcast(action, data);
    } else if (action === "join") {
      console.log(`${data.pseudo} a rejoint le jeu`);
      users.push(data.pseudo);
      broadcast("users", users);
      socket.send(JSON.stringify({ action: "users", data: users }));
    } else if (action === "chat") {
      messages.push(data);
      broadcast("new_message", data);
    }

    socket.on("close", () => {
      users = users.filter((u) => u !== data.pseudo);
      broadcast("users", users);
    });
  });
});

server.listen(8080, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
