const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Objeto para almacenar el historial de mensajes de cada sala
const messageHistory = {};

io.on("connection", (socket) => {
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User Connect: ${socket.id} to the room ${room}`);

    // Envía el historial de mensajes de la sala actual al usuario que se une
    if (messageHistory[room]) {
      socket.emit("load_history", messageHistory[room]);
    } else {
      messageHistory[room] = []; // Inicializa la sala si no existe
    }
  });

  // Evento para indicar que el usuario está escribiendo
  socket.on("typing", (data) => {
    socket.to(data.room).emit("display_typing", data);
  });

  socket.on("send_message", (data) => {
    const { room } = data;

    // Guarda el mensaje en el historial de la sala correspondiente
    if (messageHistory[room]) {
      messageHistory[room].push(data);
    }

    // Envía el mensaje a todos los usuarios de la sala excepto al remitente
    socket.to(room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnect", socket.id);
  });

  socket.on("delete_message", (data) => {
    const { room, messageId } = data;

    // Elimina el mensaje del historial de la sala
    if (messageHistory[room]) {
      messageHistory[room] = messageHistory[room].filter(
        (message) => message.id !== messageId
      );

      // Envía el historial actualizado a todos los usuarios de la sala
      io.to(room).emit("update_messages", messageHistory[room]);
    }
  });

  socket.on("edit_message", (data) => {
    const { id, newMessage } = data;

    for (const room in messageHistory) {
      const messageIndex = messageHistory[room].findIndex(
        (msg) => msg.id === id
      );
      if (messageIndex !== -1) {
        // Actualizar el contenido del mensaje
        messageHistory[room][messageIndex].message = newMessage;
        io.to(room).emit("message_edited", { id, newMessage }); // Notificar a todos los clientes en la sala
        break;
      }
    }
  });
});

server.listen(3001, () => {
  console.log("on port listen: 3001");
});
