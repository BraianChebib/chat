const express = require("express");
const cors = require("cors");
require("dotenv").config();

const apiRoutes = require("./routes/apiRoutes");
const { connectToDatabase } = require("./config/database");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to the database
connectToDatabase();

// Routes
app.use("/api", apiRoutes);

module.exports = app;
