import React, { useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

const EmojiPickerWrapper = ({ setCurrentMessage }) => {
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setCurrentMessage((prev) => prev);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={emojiPickerRef}
      style={{ position: "absolute", bottom: "60px", left: "20px" }}
    >
      <EmojiPicker
        onEmojiClick={(emoji) => {
          setCurrentMessage((prev) => prev + emoji.emoji);
        }}
      />
    </div>
  );
};

export default EmojiPickerWrapper;
