import React from "react"; 
import InitChat from "./views/InitChat";
import CreateRoom from "./views/CreateRoom";
import JoinRoom from "./views/JoinRoom";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<InitChat />} />
        {/* Create Room route */}
        <Route path="/CreateRoom" element={<CreateRoom />} />
        {/* Join Room route */}
        <Route path="/JoinRoom" element={<JoinRoom />} />
      </Routes>
    </>
  );
}

export default App;
