import React from "react";
import "../../assets/css/Chat.css";

const ChatList = ({ conversations, onSelect, activeId }) => {
  return (
    <div className="chat-list">
      {conversations.map((c) => (
        <div
          key={c.id}
          className={`chat-list-item ${activeId === c.id ? "active" : ""}`}
          onClick={() => onSelect(c)}
        >
          <strong>{c.name}</strong>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
