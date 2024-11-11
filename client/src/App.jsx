import { useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Chat from "./Chat";

const socket = io.connect("http://localhost:3001");

function App() {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("");

  const joinRoom = () => {
    if (userName && room) {
      socket.emit("join_room", room);
    }
  };
  return (
    <>
      <h3>Sala</h3>
      <input
        type="text"
        placeholder="Name User"
        onChange={(e) => setUserName(e.target.value)}
      />
      <input
        type="text"
        placeholder="ID Room"
        onChange={(e) => {
          setRoom(e.target.value);
        }}
      />
      <button onClick={joinRoom}>Enviar</button>
      <Chat socket={socket} userName={userName} room={room} />
    </>
  );
}

export default App;
