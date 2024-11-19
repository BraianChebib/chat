import React, { useEffect, useState, useRef } from "react";
import {
  CardContent,
  Card,
  Form,
  FormField,
  Input,
  Message,
  MessageHeader,
  Divider,
  Button,
  Placeholder,
} from "semantic-ui-react";
import ScrollToBottom from "react-scroll-to-bottom";
import EmojiPicker from "emoji-picker-react";

const Chat = ({ socket, userName, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const emojiPickerRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [newMessageContent, setNewMessageContent] = useState("");

  const sendMessage = async () => {
    if (userName && currentMessage) {
      const data = {
        id: Date.now(), // Usamos el tiempo actual como un ID único
        message: currentMessage,
        author: userName,
        room,
        time:
          new Date(Date.now()).getHours().toString().padStart(2, "0") +
          ":" +
          new Date(Date.now()).getMinutes().toString().padStart(2, "0"),
      };
      await socket.emit("send_message", data);
      setCurrentMessage("");
      setMessagesList((list) => [...list, data]);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { room, userName });
  };

  const onEmojiClick = (emoji) => {
    const emojiChar = emoji.emoji || emoji;
    setCurrentMessage((prevMessage) => prevMessage + emojiChar);
  };

  useEffect(() => {
    const message = (data) => setMessagesList((list) => [...list, data]);

    const loadHistory = (history) => setMessagesList(history);

    const displayTyping = (data) => {
      if (data.userName !== userName && !isTyping) {
        setTypingStatus(`${data.userName} está escribiendo...`);
        setIsTyping(true);

        setTimeout(() => {
          setTypingStatus("");
          setIsTyping(false); // Permitir que el mensaje vuelva a mostrarse después del tiempo
        }, 2000); // 2000 ms para ocultar el mensaje
      }
    };

    socket.on("receive_message", message);
    socket.on("load_history", loadHistory);
    socket.on("display_typing", displayTyping);

    return () => {
      socket.off("receive_message", message);
      socket.off("load_history", loadHistory);
      socket.off("display_typing", displayTyping);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const deleteMessage = (messageId) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este mensaje?"
    );
    if (confirmDelete) {
      socket.emit("delete_message", { room, messageId }); // Emitimos el evento al backend
    }

    setMessagesList((list) =>
      list.filter((message) => message.id !== messageId)
    );
  };

  useEffect(() => {
    const updateMessages = (updatedMessages) => {
      setMessagesList(updatedMessages);
    };

    socket.on("update_messages", updateMessages);

    return () => {
      socket.off("update_messages", updateMessages);
    };
  }, [socket]);

  const handleEditMessage = (id, currentContent) => {
    setEditingMessageId(id); // Establece el ID del mensaje en edición
    setNewMessageContent(currentContent); // Prellena el input con el mensaje actual
  };

  const submitEditMessage = () => {
    if (newMessageContent.trim() && editingMessageId !== null) {
      const originalMessage = messagesList.find(
        (msg) => msg.id === editingMessageId
      );

      // Verifica si el contenido cambió antes de emitir el evento
      if (originalMessage.message !== newMessageContent.trim()) {
        socket.emit("edit_message", {
          id: editingMessageId,
          newMessage: newMessageContent.trim(),
        });
      }

      setEditingMessageId(null); // Limpia el estado de edición
      setNewMessageContent("");
    }
  };

  useEffect(() => {
    const handleMessageEdited = ({ id, newMessage }) => {
      setMessagesList((list) =>
        list.map((msg) =>
          msg.id === id
            ? { ...msg, message: newMessage, edited: true } // Marca como editado
            : msg
        )
      );
    };

    socket.on("message_edited", handleMessageEdited);

    return () => {
      socket.off("message_edited", handleMessageEdited);
    };
  }, [socket]);

  return (
    <Card fluid>
      <CardContent header={`Chat en vivo | Sala: ${room}`} />
      <CardContent extra>
        <ScrollToBottom>
          <Card.Content style={{ height: "400px", overflowY: "auto" }}>
            {messagesList.map((item) => (
              <>
                <Message
                  key={item.id} // Usamos el ID único
                  style={{
                    textAlign: userName === item.author ? "right" : "left",
                  }}
                  success={userName === item.author}
                  info={userName !== item.author}
                >
                  {editingMessageId === item.id ? (
                    <Input
                      value={newMessageContent}
                      onChange={(e) => setNewMessageContent(e.target.value)}
                      onBlur={submitEditMessage} // Guardar cuando pierde el foco
                      action={{
                        color: "teal",
                        icon: "check",
                        onClick: submitEditMessage, // Guardar al hacer clic
                      }}
                    />
                  ) : (
                    <MessageHeader>
                      {item.message}

                      {userName === item.author && (
                        <Button
                          icon="trash"
                          size="mini"
                          color="red"
                          style={{ marginLeft: "10px" }}
                          onClick={() => deleteMessage(item.id)}
                        />
                      )}
                      {userName === item.author && (
                        <Button
                          size="mini"
                          color="blue"
                          style={{ marginLeft: "10px" }}
                          onClick={() =>
                            handleEditMessage(item.id, item.message)
                          }
                        >
                          Editar
                        </Button>
                      )}
                    </MessageHeader>
                  )}
                  {userName === item.author
                    ? item.time
                    : `${item.author}: ${item.time}`}
                  {item.edited && (
                    <span style={{ marginLeft: "5px", color: "gray" }}>
                      (Editado)
                    </span>
                  )}
                </Message>
              </>
            ))}
          </Card.Content>

          <div style={{ height: "30px" }}>
            {typingStatus && (
              <Placeholder>
                <p style={{ color: "black", margin: "0" }}>{typingStatus}</p>
              </Placeholder>
            )}
          </div>
        </ScrollToBottom>
        <Divider />
        <Form>
          <FormField>
            <Input
              placeholder="Escribe un mensaje..."
              value={currentMessage}
              onChange={(e) => {
                setCurrentMessage(e.target.value);
                handleTyping();
              }}
              type="text"
              action
            >
              <input />
              <Button
                color="teal"
                icon="send"
                content="Enviar"
                onClick={sendMessage}
              />
              <Button
                icon="smile"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
            </Input>

            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                style={{ position: "absolute", bottom: "60px", left: "20px" }}
              >
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </FormField>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Chat;
