import React, { useState, useEffect } from "react";
import {
  Message,
  Button,
  Input,
  MessageHeader,
  Modal,
} from "semantic-ui-react";

const ChatMessages = ({
  messagesList,
  userName,
  setEditingMessageId,
  setNewMessageContent,
  setOriginalMessageContent,
  socket,
  editingMessageId,
  newMessageContent,
  submitEditMessage,
  room,
}) => {
  const [open, setOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Escucha la tecla Enter dentro del modal para guardar cambios
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && editModalOpen) {
        handleEditSubmit(); // Llama a la función de guardar cambios al presionar Enter
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editModalOpen, newMessageContent]); // Se ejecuta solo cuando se abre el modal o cambia el contenido del mensaje

  const confirmDelete = (messageId) => {
    setMessageToDelete(messageId);
    setOpen(true);
  };

  const handleDelete = () => {
    socket.emit("delete_message", { room, messageId: messageToDelete });
    setOpen(false);
    setMessageToDelete(null);
  };

  const openEditModal = (message) => {
    setNewMessageContent(message.message); // Establece el contenido del mensaje a editar
    setEditingMessageId(message._id); // Establece el mensaje que se está editando
    setEditModalOpen(true); // Abre el modal de edición
    setOriginalMessageContent(message.message); // Guarda el contenido original
  };

  const handleEditSubmit = () => {
    submitEditMessage(); // Llama a la función para actualizar el mensaje
    setEditModalOpen(false); // Cierra el modal después de la edición
  };

  return (
    <div style={{ height: "400px", overflowY: "auto", padding: "20px" }}>
      {messagesList.map((item) => (
        <Message
          key={item._id}
          style={{
            textAlign: userName === item.author ? "right" : "left",
            marginBottom: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            backgroundColor: userName === item.author ? "#e6f7ff" : "#f5f5f5", // Diferente color para mensajes enviados y recibidos
          }}
          success={userName === item.author}
          info={userName !== item.author}
        >
          {editingMessageId === item._id ? (
            // El campo de entrada dentro del modal de edición
            <Input
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              style={{
                borderRadius: "4px",
                marginBottom: "10px",
                width: "100%",
              }}
            />
          ) : (
            <>
              <MessageHeader style={{ fontSize: "16px", fontWeight: "bold" }}>
                {item.message}
                {userName === item.author && (
                  <>
                    <Button
                      icon="pencil"
                      size="mini"
                      color="blue"
                      style={{ marginLeft: "10px" }}
                      onClick={() => openEditModal(item)} // Abre el modal de edición
                    />
                    <Button
                      icon="trash"
                      size="mini"
                      color="red"
                      style={{ marginLeft: "5px" }}
                      onClick={() => confirmDelete(item._id)}
                    />
                  </>
                )}
              </MessageHeader>
              <div
                style={{ fontSize: "12px", color: "gray", marginTop: "5px" }}
              >
                {userName === item.author
                  ? item.time
                  : `${item.author}: ${item.time}`}
                {item.edited && (
                  <span
                    style={{
                      marginLeft: "5px",
                      fontSize: "12px",
                      color: "gray",
                    }}
                  >
                    (Editado)
                  </span>
                )}
              </div>
            </>
          )}
        </Message>
      ))}

      {/* Modal para Confirmar Eliminación */}
      <Modal size="mini" open={open} onClose={() => setOpen(false)}>
        <Modal.Header>Confirmar Eliminación</Modal.Header>
        <Modal.Content>
          <p>¿Estás seguro de que quieres eliminar este mensaje?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button positive onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Actions>
      </Modal>

      {/* Modal para Editar Mensaje */}
      <Modal
        size="mini"
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <Modal.Header>Editar Mensaje</Modal.Header>
        <Modal.Content>
          <Input
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            style={{
              width: "100%",
              borderRadius: "4px",
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            negative
            onClick={() => {
              setEditModalOpen(false); // Cierra el modal de edición
              setEditingMessageId(null); // Resetea el id del mensaje que se está editando
              setNewMessageContent(""); // Resetea el contenido del mensaje a editar
            }}
          >
            Cancelar
          </Button>

          <Button positive onClick={handleEditSubmit}>
            Guardar Cambios
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default ChatMessages;
