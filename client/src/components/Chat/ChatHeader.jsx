import React from "react";
import { CardContent, Card } from "semantic-ui-react";

const ChatHeader = ({ room, author }) => (
  <CardContent>
    <Card.Header style={{ display: "flex", justifyContent: "space-around" }}>
      <span>Sala: {room}</span>
      <span>User: {author}</span>
    </Card.Header>
  </CardContent>
);

export default ChatHeader;
