import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Container,
  Header,
} from "semantic-ui-react";

const InitChat = () => {
  const navigate = useNavigate();

  const onClickHandlerCreateRoom = () => {
    navigate("/CreateRoom");
  };

  const onClickHandlerJoinRoom = () => {
    navigate("/JoinRoom");
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
      <Card raised>
        <CardContent>
          <Header as="h2" style={{ marginBottom: "30px" }}>
            Bienvenido al Chat
          </Header>
          <Button
            onClick={onClickHandlerCreateRoom}
            primary
            style={{ marginBottom: "20px" }}
            size="large"
            fluid
          >
            Crear Sala
          </Button>
          <Button onClick={onClickHandlerJoinRoom} secondary size="large" fluid>
            Unirme a Sala
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default InitChat;
