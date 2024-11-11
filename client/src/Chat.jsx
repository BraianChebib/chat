import { useEffect, useState } from "react";

const Chat = ({ socket, userName, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");

  const sendMessage = async () => {
    if (userName && currentMessage) {
      const data = {
        message: currentMessage,
        author: userName,
        room,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", data);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log(data);
    });
  }, [socket]);

  return (
    <>
      <section className="header">Sala de Chat</section>
      <section className="body"></section>
      <section className="footer">
        <input
          type="text"
          placeholder="Message ..."
          onChange={(e) => {
            setCurrentMessage(e.target.value);
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </section>
    </>
  );
};

export default Chat;
