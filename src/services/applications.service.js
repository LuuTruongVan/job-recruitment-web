// src/services/applications.service.js
import axios from "axios";

const API_URL = "http://localhost:3000";

export const getCandidateApplications = (token) =>
  axios.get(`${API_URL}/applications/get`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const cancelApplication = (id, token) =>
  axios.delete(`${API_URL}/applications/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
