// Import MongoDB models for Messages and Rooms
const { Message, Room } = require("../models/Message");
const mongoose = require("mongoose");

// Define the Socket.IO event handlers
const socketHandlers = (io) => {
  // Handle the connection of a new client
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Event to create a new room
    socket.on("create_room", async (data) => {
      const { roomName, users } = data;

      try {
        if (
          !roomName ||
          !users ||
          !Array.isArray(users) ||
          users.length === 0
        ) {
          return socket.emit("room_created", {
            success: false,
            message: "Datos faltantes.",
          });
        }

        // Check if the room already exists
        const existingRoom = await Room.findOne({ roomName });
        if (existingRoom) {
          return socket.emit("room_created", {
            success: false,
            message:
              "La sala con ese ID ya existe, por favor ingresa un ID nuevo",
          });
        }

        // Create the new room and save it to the database
        const newRoom = new Room({ roomName, users });
        await newRoom.save();

        // Add the creator to the room and confirm creation
        socket.join(roomName);
        socket.emit("room_created", {
          success: true,
          message: "Sala creada exitosamente.",
        });
      } catch (error) {
        console.error("Error al crear la sala:", error);
        socket.emit("room_created", {
          success: false,
          message: "Error al crear la sala.",
        });
      }
    });

    // Event to join an existing room
    socket.on("join_room", async (data) => {
      const { room, userName } = data;
      socket.userName = userName;

      try {
        const existingRoom = await Room.findOne({ roomName: room });
        if (!existingRoom) {
          return socket.emit("join_room_error", {
            success: false,
            message: "La sala no existe.",
          });
        }

        // Check if the username is already taken
        const userExists = existingRoom.users.some(
          (user) => user.username === userName
        );

        if (userExists) {
          return socket.emit("join_room_error", {
            success: false,
            message: `El nombre de usuario "${userName}" ya está en uso en esta sala.`,
          });
        }

        // Add the user to the room and load the message history
        existingRoom.users.push({
          userId: socket.id,
          username: userName,
        });
        await existingRoom.save();

        socket.join(room);
        socket.emit("join_room_success", {
          success: true,
          message: `Bienvenido a la sala ${room}`,
        });
        socket.emit("load_history", { messages: existingRoom.messages });
      } catch (error) {
        console.error("Error al unirse a la sala:", error);
        socket.emit("join_room_error", {
          success: false,
          message: "Error al unirse a la sala.",
        });
      }
    });

    // Request the message history of a room
    socket.on("request_history", async (data) => {
      const { room } = data;

      try {
        const existingRoom = await Room.findOne({ roomName: room }).populate(
          "messages"
        );
        if (existingRoom) {
          socket.emit("load_history", { messages: existingRoom.messages });
        }
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      }
    });

    // Handle sending a new message
    socket.on("send_message", async (data) => {
      const { room, userId, message, author, time } = data;

      if (!room || !userId || !message || !author || !time) {
        console.error("Datos incompletos:", data);
        return;
      }

      try {
        const newMessage = new Message({ room, userId, message, author, time });
        await newMessage.save();

        // Associate the message with the room
        await Room.findOneAndUpdate(
          { roomName: room },
          { $push: { messages: newMessage._id } }
        );

        io.in(data.room).emit("receive_message", newMessage);
      } catch (err) {
        console.error("Error al guardar el mensaje:", err);
      }
    });

    // Handle editing messages
    socket.on("edit_message", async (data) => {
      const { _id, newMessage } = data;

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        console.error("ID no válido:", _id);
        return;
      }

      try {
        const message = await Message.findById(_id);

        if (!message) {
          console.error("Mensaje no encontrado");
          return;
        }

        if (message.message === newMessage) {
          console.log("No hubo cambios en el mensaje");
          return;
        }

        const updatedMessage = await Message.findByIdAndUpdate(
          _id,
          { message: newMessage, edited: true },
          { new: true }
        );

        if (!updatedMessage) {
          console.error("Mensaje no encontrado para actualizar");
          return;
        }

        io.to(updatedMessage.room).emit("message_edited", updatedMessage);
      } catch (err) {
        console.error("Error al editar el mensaje:", err);
      }
    });

    // Handle deleting messages
    socket.on("delete_message", async (data) => {
      const { room, messageId } = data;

      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        console.error("ID de mensaje no válido:", messageId);
        return;
      }

      try {
        const deletedMessage = await Message.findByIdAndDelete(messageId);

        if (!deletedMessage) {
          console.error("Mensaje no encontrado");
          return;
        }

        io.to(room).emit("message_deleted", messageId);
      } catch (err) {
        console.error("Error al eliminar el mensaje:", err);
      }
    });

    // Handle the "typing" state
    socket.on("typing", (data) => {
      const { room, userName } = data;

      if (!room || !userName) {
        console.error("Datos incompletos:", data);
        return;
      }

      socket.to(room).emit("display_typing", { userName });
    });

    // User disconnection
    socket.on("disconnect", async () => {
      const rooms = Array.from(socket.rooms);
      const room = rooms.length > 1 ? rooms[1] : null;

      if (room) {
        try {
          const existingRoom = await Room.findOne({ roomName: room });

          if (existingRoom) {
            existingRoom.users = existingRoom.users.filter(
              (user) => user.username !== socket.userName
            );
            await existingRoom.save();

            io.to(room).emit("user_left", { userName: socket.userName });
          }
        } catch (error) {
          console.error("Error al eliminar usuario:", error);
        }
      }
    });
  });
};

module.exports = socketHandlers;
