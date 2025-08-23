import { useState, useEffect } from "react";
import {
  getUserConversations,
  getMessages,
  createConversation,
  sendMessage,
} from "../services/chat.service";

export const useChat = (currentUserId) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách hội thoại của user
  useEffect(() => {
    if (!currentUserId) return;
    const fetchConversations = async () => {
      try {
        const data = await getUserConversations(currentUserId);
        setConversations(data);
      } catch (err) {
        console.error("Lỗi tải hội thoại:", err);
      }
    };
    fetchConversations();
  }, [currentUserId]);

  // Lấy tin nhắn khi chọn hội thoại
  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const msgs = await getMessages(conversation.id);
      setMessages(msgs);
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    }
  };

  // Mở chat từ trang JobDetail
  const startChat = async (receiverId) => {
    setLoading(true);
    try {
      const newConv = await createConversation(currentUserId, receiverId);
      setSelectedConversation(newConv);
      const msgs = await getMessages(newConv.id);
      setMessages(msgs);
    } catch (err) {
      console.error("Lỗi mở chat:", err);
    } finally {
      setLoading(false);
    }
  };

  // Gửi tin nhắn
  const handleSend = async (message) => {
    if (!selectedConversation) return;
    try {
      const newMsg = await sendMessage(
        selectedConversation.id,
        currentUserId,
        message
      );
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  return {
    conversations,
    selectedConversation,
    messages,
    selectConversation,
    handleSend,
    startChat,
    loading,
  };
};
