import React from "react";

const Message = ({ message, currentUserId }) => {
  const isMine = message.sender_id === currentUserId;

  return (
    <div className={`message ${isMine ? "mine" : "theirs"}`}>
      <div className="message-content">{message.content}</div>
    </div>
  );
};

export default Message;
