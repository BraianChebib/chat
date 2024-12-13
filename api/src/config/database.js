// Import Mongoose to interact with MongoDB
const mongoose = require("mongoose");

// Load environment variables from a .env file
require("dotenv").config();

// Async function to connect to the MongoDB database
const connectToDatabase = async () => {
  // Try to connect to MongoDB using the URL defined in the environment variables
  mongoose
    .connect(process.env.URL_MONGODB)
    .then(() => console.log("Conectado a MongoDB")) // Success message
    .catch((err) => {
      // Show the error if the connection fails
      console.error("Error de conexión:", err);
      process.exit(1); // Terminate the application in case of a critical error
    });
};

// Export the function for use in other files
module.exports = { connectToDatabase };
