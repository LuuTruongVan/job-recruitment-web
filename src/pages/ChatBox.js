import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ selectedConversation, messages, onSend, currentUserId }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    // chỉ scroll khi messages tăng lên (tin nhắn mới)
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
    <div className="chat-box" style={{ flex: 1, display: "flex", flexDirection: "column", border: "1px solid #ccc", borderRadius: "10px", height: "600px" }}>
      <div style={{ height: "60px", background: "#007bff", color: "white", display: "flex", alignItems: "center", padding: "0 15px", fontWeight: "bold" }}>
        {selectedConversation.name || selectedConversation.employer_name || selectedConversation.candidate_name}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              maxWidth: "70%",
              padding: "8px 12px",
              borderRadius: "15px",
              alignSelf: msg.sender_id === currentUserId ? "flex-end" : "flex-start",
              backgroundColor: msg.sender_id === currentUserId ? "#007bff" : "#e5e5ea",
              color: msg.sender_id === currentUserId ? "white" : "black",
              wordBreak: "break-word",
            }}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div style={{ height: "60px", display: "flex", borderTop: "1px solid #ccc" }}>
        <input
          style={{ flex: 1, border: "none", padding: "0 15px", fontSize: "16px" }}
          type="text"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button style={{ width: "80px", border: "none", background: "#007bff", color: "white", fontWeight: "bold" }} onClick={handleSend}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
