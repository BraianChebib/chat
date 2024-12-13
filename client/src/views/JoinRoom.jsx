import React from "react";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import Chat from "../components/Chat/Chat";
import {
  Container,
  CardContent,
  Card,
  FormField,
  Button,
  Form,
  Input,
  Message,
} from "semantic-ui-react";
import { useNavigate } from "react-router-dom";

const port = import.meta.env.APP_API_URL || "http://localhost:3001";
const socket = io.connect(`${port}`);

const JoinRoom = () => {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState([]);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const handleJoinError = (response) => {
      if (!response.success) {
        setServerError(response.message);
      }
    };

    const handleJoinSuccess = () => {
      setShowChat(true);
      setServerError("");
    };

    socket.on("join_room_error", handleJoinError);
    socket.on("join_room_success", handleJoinSuccess);

    return () => {
      socket.off("join_room_error", handleJoinError);
      socket.off("join_room_success", handleJoinSuccess);
    };
  }, [room]);

  const resetToInitialView = () => {
    setUserName("");
    setRoom("");
    setShowChat(false);
    setError([]);
    setServerError("");
    navigate("/");
  };

  const joinRoom = () => {
    const newErrorMessages = [];

    if (!room) newErrorMessages.push("No se ingresó el ID de la sala.");
    if (!userName) newErrorMessages.push("No se ingresó un nombre de usuario.");

    if (newErrorMessages.length > 0) {
      setError(newErrorMessages);
    } else {
      socket.emit("join_room", { room, userName });
      setError([]);
    }
  };

  const handleCloseError = () => {
    setError([]);
    setServerError("");
  };

  return (
    <Container
      textAlign="center"
      style={{
        height: "100vh", // Occupy the entire height of the viewport
        display: "flex", // Use Flexbox
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        margin: 0, // Remove any margin
      }}
    >
      {error.length > 0 && !serverError && (
        <Message
          negative
          style={{ padding: "20px", fontSize: "18px", width: "80%" }}
        >
          <Message.Header>Hubo un problema al unirse a la sala</Message.Header>
          <Message.List>
            {error.map((err, index) => (
              <Message.Item key={index}>
                <strong>{err}</strong>
              </Message.Item>
            ))}
          </Message.List>
          <Button
            style={{ marginTop: "15px" }}
            onClick={handleCloseError}
            color="red"
          >
            Aceptar
          </Button>
        </Message>
      )}

      {serverError && !error.length && (
        <Message
          negative
          style={{ padding: "20px", fontSize: "18px", width: "80%" }}
        >
          <Message.Header>Error del servidor</Message.Header>
          <p>
            <strong>{serverError}</strong>
          </p>
          <Button onClick={handleCloseError} color="red">
            Cerrar
          </Button>
        </Message>
      )}

      {!showChat && !error.length && !serverError && (
        <Card fluid>
          <CardContent
            header="Unirme a una sala"
            style={{ fontSize: "20px" }}
          />
          <CardContent>
            <Form>
              <FormField>
                <h3>ID de la Sala</h3>
                <Input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </FormField>
              <FormField>
                <h3>Nombre de Usuario</h3>
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </FormField>
              <Button onClick={joinRoom} primary>
                Unirme
              </Button>
            </Form>
            {!showChat && !error.length && !serverError && (
              <div style={{ marginTop: "20px" }}>
                <Button onClick={resetToInitialView} color="grey">
                  Volver al Inicio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showChat && (
        <Chat
          socket={socket}
          userName={userName}
          room={room}
          resetToInitialView={resetToInitialView}
        />
      )}
    </Container>
  );
};

export default JoinRoom;
