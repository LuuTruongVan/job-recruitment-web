import React, { useState, useEffect, useRef } from "react";
import "../../assets/css/Chat.css";

const ChatBox = ({ selectedConversation, messages, onSend, currentUserId, onBack, isMobile }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const handleSend = () => {
    if (input.trim() !== "") {
      onSend(input);
      setInput("");
    }
  };

  if (!selectedConversation) {
    return <div className="chat-box empty">Chọn 1 cuộc trò chuyện để bắt đầu</div>;
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        {isMobile && (
          <button className="back-btn" onClick={onBack}>
            ←
          </button>
        )}
        <span>
          {selectedConversation.name ||
            selectedConversation.employer_name ||
            selectedConversation.candidate_name}
        </span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender_id === currentUserId ? "sent" : "received"}`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatBox;
