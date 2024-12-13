import "./App.css";
import InitChat from "./views/InitChat";
import CreateRoom from "./views/CreateRoom";
import JoinRoom from "./views/JoinRoom";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        {/* Ruta de inicio  */}
        <Route path="/" element={<InitChat />} />
        {/* Ruta de Crear Sala  */}
        <Route path="/CreateRoom" element={<CreateRoom />} />
        {/* Ruta de Unirse a Sala  */}
        <Route path="/JoinRoom" element={<JoinRoom />} />
      </Routes>
    </>
  );
}

export default App;
