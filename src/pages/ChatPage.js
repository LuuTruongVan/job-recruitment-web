import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import ChatList from "../component/Chat/ChatList";
import ChatBox from "../component/Chat/ChatBox";
import { getUserConversations, getMessages } from "../services/chat.service";
import socket from "../sockets/socket";
import "../assets/css/Chat.css";

const ChatPage = ({ user }) => {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatBox, setShowChatBox] = useState(false); // ⬅️ Thêm state
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback((conversationId) => {
    getMessages(conversationId)
      .then((data) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!user) return;

    getUserConversations(user.id)
      .then((data) => {
        setConversations(data);

        if (conversationId) {
          const conv = data.find((c) => c.id === parseInt(conversationId));
          if (conv) {
            setSelectedConversation(conv);
            fetchMessages(conv.id);
            socket.emit("joinConversation", conv.id);
            setShowChatBox(true);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [user, conversationId, fetchMessages]);

  // Lắng nghe thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    socket.emit("joinConversation", conversation.id);
    if (isMobileView) setShowChatBox(true);
  };

  const handleBackToList = () => {
    setShowChatBox(false);
    setSelectedConversation(null);
  };

  const handleSendMessage = (text) => {
    if (!selectedConversation || !user) return;

    const payload = {
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      receiver_id:
        user.role === "candidate"
          ? selectedConversation.employer_id
          : selectedConversation.candidate_id,
      message: text,
    };

    socket.emit("sendMessage", payload);
    setMessages((prev) => [...prev, { ...payload, created_at: new Date(), temp: true }]);
    scrollToBottom();
  };

  useEffect(() => {
    const handleReceive = (msg) => {
      if (msg.conversation_id === selectedConversation?.id) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m.message === msg.message &&
              m.sender_id === msg.sender_id &&
              !m.temp
          );
          if (isDuplicate) return prev;
          return [...prev.filter((m) => !m.temp), msg];
        });
        scrollToBottom();
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [selectedConversation]);

  return (
    <div className="chat-page">
      {/* Nếu là mobile */}
      {isMobileView ? (
        <>
          {!showChatBox ? (
            <div className="chat-list-container">
              <ChatList
                conversations={conversations}
                onSelect={handleSelectConversation}
                activeId={selectedConversation?.id}
              />
            </div>
          ) : (
            <div className="chat-box-container">
              <ChatBox
                selectedConversation={selectedConversation}
                messages={messages}
                onSend={handleSendMessage}
                currentUserId={user?.id}
                onBack={handleBackToList}
                isMobile={true}
              />
              <div ref={messagesEndRef}></div>
            </div>
          )}
        </>
      ) : (
        // Nếu là desktop
        <div className="chat-container">
          <div className="chat-list-container">
            <ChatList
              conversations={conversations}
              onSelect={handleSelectConversation}
              activeId={selectedConversation?.id}
            />
          </div>
          <div className="chat-box-container">
            <ChatBox
              selectedConversation={selectedConversation}
              messages={messages}
              onSend={handleSendMessage}
              currentUserId={user?.id}
              isMobile={false}
            />
            <div ref={messagesEndRef}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
