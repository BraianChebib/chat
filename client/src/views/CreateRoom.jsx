import React from "react";
import { useState } from "react";
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

import { v4 as uuidv4 } from "uuid";

const userId = uuidv4();
const port = import.meta.env.APP_API_URL || "http://localhost:3001";
const socket = io.connect(`${port}`);

const CreateRoom = () => {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const [createRoom, setCreateRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState([]);
  const [serverError, setServerError] = useState(""); // State for server errors

  const navigate = useNavigate();

  const resetToInitialView = () => {
    setUserName("");
    setRoom("");
    setCreateRoom("");
    setShowChat(false);
    setError([]);
    setServerError("");
    navigate("/");
  };

  const createNewRoom = () => {
    const newErrorMessages = [];

    if (!userName)
      newErrorMessages.push("No se ingresó el nombre del usuario.");
    if (!createRoom) newErrorMessages.push("No se ingresó el ID de la sala.");

    if (newErrorMessages.length > 0) {
      setError(newErrorMessages);
    } else {
      const user = [{ userId, username: userName }];

      socket.emit("create_room", { roomName: createRoom, users: user });

      socket.off("room_created").on("room_created", (response) => {
        if (response.success) {
          setRoom(createRoom);
          setShowChat(true);
        } else {
          setServerError(response.message); // Display error
        }
      });
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
      {error.length > 0 &&
        !serverError && ( // Show only validation error if there is no server error
          <Message
            negative
            style={{ padding: "20px", fontSize: "18px", width: "80%" }}
          >
            <Message.Header>Hubo un problema al crear la sala</Message.Header>
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

      {serverError &&
        !error.length && ( // Show only server error if there are no validation errors
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
        <>
          <Card fluid>
            <CardContent header="Crear una sala" style={{ fontSize: "20px" }} />
            <CardContent>
              <Form>
                <FormField>
                  <h3>Nombre de la Sala</h3>
                  <Input
                    type="text"
                    value={createRoom}
                    onChange={(e) => setCreateRoom(e.target.value)}
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
                <Button onClick={createNewRoom} primary>
                  Crear y Entrar
                </Button>
              </Form>
              <div style={{ marginTop: "20px" }}>
                <Button onClick={resetToInitialView} color="grey">
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
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

export default CreateRoom;
