// Importa el paquete de Mongoose para interactuar con MongoDB
const mongoose = require("mongoose");

// Define el esquema para la colección de salas de chat
const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, unique: true }, // Nombre único de la sala
  users: [
    {
      userId: { type: String, required: true }, // ID único del usuario
      username: { type: String, required: true }, // Nombre del usuario en la sala
    },
  ],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], // Referencias a mensajes asociados
});

// Define el esquema para la colección de mensajes
const messageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // Nombre de la sala asociada al mensaje
  userId: { type: String, required: true }, // ID del usuario que envió el mensaje
  message: { type: String, required: true }, // Contenido del mensaje
  author: { type: String, required: true }, // Nombre del usuario que envió el mensaje
  time: { type: String, required: true }, // Hora de envío del mensaje
  edited: { type: Boolean, default: false }, // Indica si el mensaje fue editado
});

// Crea los modelos basados en los esquemas definidos
const Room = mongoose.model("Room", roomSchema); // Modelo para las salas de chat
const Message = mongoose.model("Message", messageSchema); // Modelo para los mensajes

// Exporta los modelos para su uso en otras partes de la aplicación
module.exports = { Room, Message };
