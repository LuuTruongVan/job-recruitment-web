import axios from "axios";

const API_URL = "http://localhost:3000";

export const getUserConversations = async (userId) => {
  const { data } = await axios.get(`${API_URL}/conversations/user/${userId}`);
  return data;
};

export const getMessages = async (conversationId) => {
  const { data } = await axios.get(`${API_URL}/messages/${conversationId}`);
  return data;
};

export const createConversation = async (senderId, receiverId) => {
  const { data } = await axios.post(`${API_URL}/conversations`, {
    sender_id: senderId,
    receiver_id: receiverId,
  });
  return data;
};

export const sendMessage = async (conversationId, senderId, message) => {
  const { data } = await axios.post(`${API_URL}/messages`, {
    conversation_id: conversationId,
    sender_id: senderId,
    message,
  });
  return data;
};
