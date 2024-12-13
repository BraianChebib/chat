// Import the Mongoose package to interact with MongoDB
const mongoose = require("mongoose");

// Define the schema for the chat rooms collection
const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, unique: true }, // Unique name of the room
  users: [
    {
      userId: { type: String, required: true }, // Unique user ID
      username: { type: String, required: true }, // Name of the user in the room
    },
  ],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], // References to associated messages
});

// Define the schema for the messages collection
const messageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // Name of the room associated with the message
  userId: { type: String, required: true }, // ID of the user who sent the message
  message: { type: String, required: true }, // Content of the message
  author: { type: String, required: true }, // Name of the user who sent the message
  time: { type: String, required: true }, // Time the message was sent
  edited: { type: Boolean, default: false }, // Indicates if the message was edited
});

// Create the models based on the defined schemas
const Room = mongoose.model("Room", roomSchema); // Model for the chat rooms
const Message = mongoose.model("Message", messageSchema); // Model for the messages

// Export the models for use in other parts of the application
module.exports = { Room, Message };
