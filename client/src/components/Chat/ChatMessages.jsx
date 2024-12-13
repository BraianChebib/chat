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

  // Listens for the Enter key inside the modal to save changes
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && editModalOpen) {
        handleEditSubmit(); // Calls the save changes function when Enter is pressed
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editModalOpen, newMessageContent]); // Runs only when the modal is opened or the message content changes

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
    setNewMessageContent(message.message); // Sets the content of the message to edit
    setEditingMessageId(message._id); // Sets the message being edited
    setEditModalOpen(true); // Opens the edit modal
    setOriginalMessageContent(message.message); // Saves the original content
  };

  const handleEditSubmit = () => {
    submitEditMessage(); // Calls the function to update the message
    setEditModalOpen(false); // Closes the modal after editing
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
            backgroundColor: userName === item.author ? "#e6f7ff" : "#f5f5f5", // Different color for sent and received messages
          }}
          success={userName === item.author}
          info={userName !== item.author}
        >
          {editingMessageId === item._id ? (
            // The input field inside the edit modal
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
                      onClick={() => openEditModal(item)} // Opens the edit modal
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

      {/* Modal to Confirm Deletion */}
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

      {/* Modal to Edit Message */}
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
              setEditModalOpen(false); // Closes the edit modal
              setEditingMessageId(null); // Resets the ID of the message being edited
              setNewMessageContent(""); // Resets the content of the message to edit
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
