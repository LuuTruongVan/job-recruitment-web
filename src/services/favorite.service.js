import axios from "axios";


const API_URL = "http://localhost:3000";


export const getFavorites = (token) =>
axios.get(`${API_URL}/favorites`, {
headers: { Authorization: `Bearer ${token}` },
});


export const removeFavorite = (jobId, token) =>
axios.delete(`${API_URL}/favorites/${jobId}`, {
headers: { Authorization: `Bearer ${token}` },
});


export const getJobPosition = (jobPositionId, token) =>
axios.get(`${API_URL}/jobposts/job-positions/${jobPositionId}`, {
headers: { Authorization: `Bearer ${token}` },
});


export const getUserProfile = (token) =>
axios.get(`${API_URL}/users/get-profile`, {
headers: { Authorization: `Bearer ${token}` },
});


export const applyJob = (data, token) =>
axios.post(`${API_URL}/applications/add`, data, {
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "multipart/form-data",
},
});

export const toggleFavorite = async (jobId, token, isFavorite) => {
    if (isFavorite) {
      await axios.delete(`/favorites/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(
        '/favorites',
        { jobpost_id: jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  };