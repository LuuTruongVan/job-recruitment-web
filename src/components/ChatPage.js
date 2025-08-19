import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";
import io from "socket.io-client";

// Kết nối socket
const socket = io("http://localhost:3000"); // backend port

const ChatPage = ({ user }) => {
  const { conversationId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // Ref để scroll xuống cuối chat
  const messagesEndRef = useRef(null);

  // Load tất cả conversation của user
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:3000/conversations/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setConversations(data);

        // Nếu URL có conversationId → mở luôn
        if (conversationId) {
          const conv = data.find(c => c.id === parseInt(conversationId));
          if (conv) {
            setSelectedConversation(conv);
            fetchMessages(conv.id);
            socket.emit("joinConversation", conv.id);
          }
        }
      })
      .catch(err => console.error(err));
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, conversationId]);

  // Lấy tin nhắn theo conversation
  const fetchMessages = (conversationId) => {
    fetch(`http://localhost:3000/messages/${conversationId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        scrollToBottom();
      })
      .catch(err => console.error(err));
  };

  // Scroll chat xuống cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Chọn conversation từ ChatList
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    socket.emit("joinConversation", conversation.id);
  };

  // Gửi tin nhắn
  const handleSendMessage = (text) => {
    if (!selectedConversation || !user) return;

    const payload = {
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      receiver_id: user.role === "candidate"
        ? selectedConversation.employer_id
        : selectedConversation.candidate_id,
      message: text,
    };

    // Gửi socket → backend lưu và emit realtime
    socket.emit("sendMessage", payload);

    // Hiển thị tạm thời tin nhắn ngay lập tức
    setMessages(prev => [...prev, { ...payload, created_at: new Date(), temp: true }]);
    scrollToBottom();
  };

  // Nhận tin nhắn realtime
  useEffect(() => {
    const handleReceive = (msg) => {
      if (msg.conversation_id === selectedConversation?.id) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [selectedConversation]);

  return (
    <div
      className="chat-page"
      style={{
        display: "flex",
        gap: "10px",
        height: "80vh",
        maxWidth: "1000px",
        margin: "20px auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}
    >
      {/* Danh sách conversation */}
      <div style={{ width: "30%", borderRight: "1px solid #ddd", overflowY: "auto" }}>
        <ChatList
          conversations={conversations}
          onSelect={handleSelectConversation}
          activeId={selectedConversation?.id}
        />
      </div>

      {/* Khung chat */}
      <div style={{ width: "70%", display: "flex", flexDirection: "column", backgroundColor: "#f9f9f9" }}>
        <ChatBox
          selectedConversation={selectedConversation}
          messages={messages}
          onSend={handleSendMessage}
          currentUserId={user?.id}
        />
        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
};

export default ChatPage;
