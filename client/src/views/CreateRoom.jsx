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
  const [serverError, setServerError] = useState(""); // Estado para errores del servidor

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
          setServerError(response.message); // Mostrar error
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
        height: "100vh", // Ocupa toda la altura del viewport
        display: "flex", // Usa Flexbox
        justifyContent: "center", // Centra horizontalmente
        alignItems: "center", // Centra verticalmente
        margin: 0, // Elimina cualquier margen
      }}
    >
      {error.length > 0 &&
        !serverError && ( // Mostrar solo error de validación si no hay error de servidor
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
        !error.length && ( // Mostrar solo error de servidor si no hay errores de validación
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
