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
        height: "100vh", // Ocupa toda la altura del viewport
        display: "flex", // Usa Flexbox
        justifyContent: "center", // Centra horizontalmente
        alignItems: "center", // Centra verticalmente
        margin: 0, // Elimina cualquier margen
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
