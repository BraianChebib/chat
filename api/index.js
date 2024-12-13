const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const socketHandlers = require("./src/socket/socketHandlers");

const PORT = process.env.PORT || 3001;
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Create the HTTP server
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Handle Socket.io events
socketHandlers(io);

// Start the server
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = server;
