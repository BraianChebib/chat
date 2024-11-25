import { useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Chat from "./Chat";
import {
  Container,
  CardContent,
  Card,
  FormField,
  Button,
  Form,
  Input,
} from "semantic-ui-react";

const port = import.meta.env.APP_API_URL || "http://localhost:3001";

const socket = io.connect(`${port}`);

function App() {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (userName && room) {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <Container>
      {!showChat ? (
        <Card fluid>
          <CardContent header="Unirme al chat" />
          <CardContent>
            <Form>
              <FormField>
                <label>User Name</label>
                <input
                  type="text"
                  placeholder="Name User"
                  onChange={(e) => setUserName(e.target.value)}
                />
              </FormField>
              <FormField>
                <label>ID Room</label>
                <Input
                  type="text"
                  placeholder="ID Room"
                  onChange={(e) => {
                    setRoom(e.target.value);
                  }}
                />
              </FormField>
              <Button onClick={joinRoom}>Unirme</Button>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Chat socket={socket} userName={userName} room={room} />
      )}
    </Container>
  );
}

export default App;
