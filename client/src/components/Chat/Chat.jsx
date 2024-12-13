// Importa las dependencias necesarias de React y Semantic UI
import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, Segment } from "semantic-ui-react";
import ScrollToBottom from "react-scroll-to-bottom";

// Importa componentes personalizados
import ChatHeader from "./ChatHeader"; // Encabezado del chat
import ChatMessages from "./ChatMessages"; // Lista de mensajes
import ChatInput from "./ChatInput"; // Entrada de mensajes

// Componente principal del Chat
const Chat = ({ socket, userName, room, resetToInitialView }) => {
  // Estados para gestionar mensajes, entrada de texto, y estado de escritura
  const [currentMessage, setCurrentMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [originalMessageContent, setOriginalMessageContent] = useState("");

  // Maneja eventos de mensajes del servidor
  useEffect(() => {
    const handleMessageDeleted = (messageId) => {
      if (!messageId) return;
      setMessagesList((list) => list.filter((msg) => msg._id !== messageId));
    };

    const handleEditedMessage = (updatedMessage) => {
      setMessagesList((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    };

    const handleReceiveMessage = (data) => {
      setMessagesList((prevMessages) => [...prevMessages, data]);
    };

    const handleUpdateMessages = (updatedMessages) => {
      setMessagesList(updatedMessages);
    };

    const displayTyping = (data) => {
      if (data.userName !== userName) {
        setTypingStatus(`${data.userName} está escribiendo...`);
        setIsTyping(true);
        setTimeout(() => {
          setTypingStatus("");
          setIsTyping(false);
        }, 3000); // Desactiva el estado después de 3 segundos
      }
    };

    // Registra eventos del servidor
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("message_edited", handleEditedMessage);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("update_messages", handleUpdateMessages);
    socket.on("display_typing", displayTyping);

    // Limpia eventos al desmontar el componente
    return () => {
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("message_edited", handleEditedMessage);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("update_messages", handleUpdateMessages);
      socket.off("display_typing", displayTyping);
    };
  }, [socket, userName]);

  // Carga historial de mensajes al unirse a la sala
  useEffect(() => {
    if (messagesList.length === 0 && room) {
      socket.emit("request_history", { room });
    }

    const loadHistory = (data) => {
      setMessagesList(data.messages || []);
    };

    socket.on("load_history", loadHistory);

    // Limpia evento al desmontar
    return () => {
      socket.off("load_history", loadHistory);
    };
  }, [socket, room, messagesList]);

  // Envía un mensaje nuevo al servidor
  const sendMessage = async () => {
    if (currentMessage.trim()) {
      const data = {
        userId: Date.now(), // Genera un ID temporal
        message: currentMessage,
        author: userName,
        room,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      await socket.emit("send_message", data); // Envía el mensaje
      setCurrentMessage(""); // Limpia el campo de entrada
    }
  };

  // Confirma si el usuario quiere salir del chat
  const handleExit = () => {
    const confirm = window.confirm("¿Estás seguro que quieres salir del chat?");
    if (confirm) resetToInitialView(); // Vuelve a la vista inicial
  };

  // Renderiza el componente de chat
  return (
    <Card fluid>
      <ChatHeader room={room} author={userName} />{" "}
      {/* Muestra el encabezado del chat */}
      <CardContent>
        <ScrollToBottom>
          <ChatMessages
            room={room}
            messagesList={messagesList}
            setMessagesList={setMessagesList}
            userName={userName}
            setEditingMessageId={setEditingMessageId}
            setNewMessageContent={setNewMessageContent}
            setOriginalMessageContent={setOriginalMessageContent}
            socket={socket}
            editingMessageId={editingMessageId}
            newMessageContent={newMessageContent}
            submitEditMessage={() => {
              if (newMessageContent.trim() !== originalMessageContent.trim()) {
                socket.emit("edit_message", {
                  _id: editingMessageId,
                  newMessage: newMessageContent.trim(),
                });
              }
              setEditingMessageId(null); // Finaliza la edición
            }}
          />
        </ScrollToBottom>

        <ChatInput
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          sendMessage={sendMessage}
          typingStatus={typingStatus}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          socket={socket}
          room={room}
          userName={userName}
        />

        {/* Botón para abandonar el chat */}
        <Segment textAlign="center">
          <Button
            color="red"
            inverted
            onClick={handleExit}
            content="Abandonar Chat"
            size="large"
          />
        </Segment>
      </CardContent>
    </Card>
  );
};

export default Chat;
