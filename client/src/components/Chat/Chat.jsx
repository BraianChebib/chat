// Import necessary dependencies from React and Semantic UI
import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, Segment } from "semantic-ui-react";
import ScrollToBottom from "react-scroll-to-bottom";

// Import custom components
import ChatHeader from "./ChatHeader"; // Chat header
import ChatMessages from "./ChatMessages"; // Message list
import ChatInput from "./ChatInput"; // Message input

// Main Chat component
const Chat = ({ socket, userName, room, resetToInitialView }) => {
  // States to manage messages, text input, and typing state
  const [currentMessage, setCurrentMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [originalMessageContent, setOriginalMessageContent] = useState("");

  // Handles server message events
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
        }, 3000); // Disables the state after 3 seconds
      }
    };

    // Registers server events
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("message_edited", handleEditedMessage);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("update_messages", handleUpdateMessages);
    socket.on("display_typing", displayTyping);

    // Cleans up events on component unmount
    return () => {
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("message_edited", handleEditedMessage);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("update_messages", handleUpdateMessages);
      socket.off("display_typing", displayTyping);
    };
  }, [socket, userName]);

  // Loads message history when joining the room
  useEffect(() => {
    if (messagesList.length === 0 && room) {
      socket.emit("request_history", { room });
    }

    const loadHistory = (data) => {
      setMessagesList(data.messages || []);
    };

    socket.on("load_history", loadHistory);

    // Cleans up event on unmount
    return () => {
      socket.off("load_history", loadHistory);
    };
  }, [socket, room, messagesList]);

  // Sends a new message to the server
  const sendMessage = async () => {
    if (currentMessage.trim()) {
      const data = {
        userId: Date.now(), // Generates a temporary ID
        message: currentMessage,
        author: userName,
        room,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      await socket.emit("send_message", data); // Sends the message
      setCurrentMessage(""); // Clears the input field
    }
  };

  // Confirms if the user wants to leave the chat
  const handleExit = () => {
    const confirm = window.confirm("¿Estás seguro que quieres salir del chat?");
    if (confirm) resetToInitialView(); // Goes back to the initial view
  };

  // Renders the chat component
  return (
    <Card fluid>
      <ChatHeader room={room} author={userName} />{" "}
      {/* Displays the chat header */}
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
              setEditingMessageId(null); // Ends editing
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

        {/* Button to leave the chat */}
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
