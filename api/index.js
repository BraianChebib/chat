const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const socketHandlers = require("./src/socket/socketHandlers");

const PORT = process.env.PORT || 3001;
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Crear el servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Manejo de eventos de Socket.io
socketHandlers(io);

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
