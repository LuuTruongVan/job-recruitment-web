import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getFavorites,
  toggleFavorite as toggleFavoriteService,
  getJobPosition,
  getUserProfile,
  applyJob,
} from "../services/favorite.service";

export const useFavorites = () => {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [formData, setFormData] = useState({
    candidate_name: "",
    phone: "",
    email: "",
    address: "",
    skills: "",
    introduction: "",
    cv: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]); 

  const navigate = useNavigate();

  const token =
    localStorage.getItem("candidate_token") ||
    localStorage.getItem("employer_token") ||
    localStorage.getItem("admin_token") ||
    "";

  
  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await getFavorites(token);
      const jobsData = res.data;

      
      const jobsWithPositions = await Promise.all(
        jobsData.map(async (job) => {
          if (job.job_position_id) {
            try {
              const positionResponse = await getJobPosition(job.job_position_id, token);
              job.job_position = positionResponse.data.name || "Chưa có vị trí";
            } catch {
              job.job_position = "Chưa có vị trí";
            }
          } else {
            job.job_position = "Chưa có vị trí";
          }
          
          return { ...job, favorite_count: job.count_favorite || 0 };
        })
      );

      setFavorites(jobsData.map((job) => job.id));
      setJobs(jobsWithPositions);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Không thể tải danh sách yêu thích.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Lấy thông tin user
  useEffect(() => {
    if (!token) return;
    getUserProfile(token)
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    fetchFavorites();
  }, [fetchFavorites, token]);


  const toggleFavorite = async (jobId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isFavorite = jobs.some((job) => job.id === jobId);
    try {
      await toggleFavoriteService(jobId, token, isFavorite);
      if (isFavorite) {
        setFavorites((prev) => prev.filter((id) => id !== jobId));
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      } else {
       
        const jobDetails = await axios.get(`/jobposts/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newJob = {
          ...jobDetails.data,
          favorite_count: jobDetails.data.count_favorite || 0,
        };
        setFavorites((prev) => [...prev, jobId]);
        setJobs((prev) => [...prev, newJob]);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Không thể cập nhật yêu thích.");
    }
  };

  
  const handleApplyClick = (job) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "employer") {
      alert("Tài khoản công ty không thể ứng tuyển!");
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleFormChange = (e) => {
    if (e.target.name === "cv") {
      setFormData({ ...formData, cv: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    const candidateToken = localStorage.getItem("candidate_token");
    if (!candidateToken) {
      setApplyMessage("Vui lòng đăng nhập với vai trò ứng viên.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("jobpost_id", selectedJob.id);

    try {
      await applyJob(data, candidateToken);
      setApplyMessage("Ứng tuyển thành công!");
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error applying job:", error);
      setApplyMessage(
        `Lỗi ứng tuyển: ${error.response?.data?.message || "Vui lòng thử lại."}`
      );
    }
  };

  return {
    jobs,
    user,
    formData,
    selectedJob,
    showApplyModal,
    applyMessage,
    setShowApplyModal,
    loading,
    error,
    toggleFavorite,
    handleApplyClick,
    handleFormChange,
    submitApplication,
    refreshFavorites: fetchFavorites,
    favorites,
  };
};