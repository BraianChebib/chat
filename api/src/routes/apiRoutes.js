// Import Express to create routes and handle HTTP requests
const express = require("express");

// Import the messages model from the models folder
const { Message } = require("../models/Message");

// Create an Express router
const router = express.Router();

// Define a GET route to fetch all messages
router.get("/messages", async (req, res) => {
  try {
    // Find all documents in the messages collection
    const messages = await Message.find();

    // Return the found messages with an HTTP 200 status
    res.status(200).json(messages);
  } catch (error) {
    // Handle server errors and return an HTTP 500 status
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

// Export the router to use it in other files
module.exports = router;
