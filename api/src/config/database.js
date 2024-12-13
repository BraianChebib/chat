// Importa Mongoose para interactuar con MongoDB
const mongoose = require("mongoose");

// Carga las variables de entorno desde un archivo .env
require("dotenv").config();

// Función asincrónica para conectar a la base de datos de MongoDB
const connectToDatabase = async () => {
  // Intenta conectar a MongoDB usando la URL definida en las variables de entorno
  mongoose
    .connect(process.env.URL_MONGODB)
    .then(() => console.log("Conectado a MongoDB")) // Mensaje de éxito
    .catch((err) => {
      // Muestra el error si la conexión falla
      console.error("Error de conexión:", err);
      process.exit(1); // Finaliza la aplicación en caso de error crítico
    });
};

// Exporta la función para su uso en otros archivos
module.exports = { connectToDatabase };
