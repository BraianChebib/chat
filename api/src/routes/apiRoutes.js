// Importa Express para crear rutas y manejar solicitudes HTTP
const express = require("express");

// Importa el modelo de mensajes desde la carpeta de modelos
const { Message } = require("../models/Message");

// Crea un enrutador de Express
const router = express.Router();

// Define una ruta GET para obtener todos los mensajes
router.get("/messages", async (req, res) => {
  try {
    // Busca todos los documentos en la colección de mensajes
    const messages = await Message.find();

    // Devuelve los mensajes encontrados con un estado HTTP 200
    res.status(200).json(messages);
  } catch (error) {
    // Maneja errores de servidor y devuelve un estado HTTP 500
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

// Exporta el enrutador para usarlo en otros archivos
module.exports = router;
