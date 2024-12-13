import React from "react";
import { Form, FormField, Input, Button } from "semantic-ui-react";
import EmojiPickerWrapper from "./EmojiPickerWrapper";

const ChatInput = ({
  currentMessage,
  setCurrentMessage,
  sendMessage,
  typingStatus,
  showEmojiPicker,
  setShowEmojiPicker,
  socket,
  room,
  userName,
}) => (
  <>
    <div style={{ height: "30px" }}>
      {typingStatus && <p style={{ color: "teal" }}>{typingStatus}</p>}
    </div>
    <Form>
      <FormField>
        <Input
          placeholder="Escribe un mensaje..."
          value={currentMessage}
          onChange={(e) => {
            setCurrentMessage(e.target.value);
            socket.emit("typing", { room, userName });
          }}
          action
        >
          <input />
          <Button color="teal" icon="send" onClick={sendMessage} />
          <Button
            icon="smile"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
        </Input>
        {showEmojiPicker && (
          <EmojiPickerWrapper setCurrentMessage={setCurrentMessage} />
        )}
      </FormField>
    </Form>
  </>
);

export default ChatInput;
